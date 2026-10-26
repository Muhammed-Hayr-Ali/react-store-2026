/**
 * @file app/[locale]/(store)/categories/[slug]/page.tsx
 * @description Category storefront page displaying filtered products with infinite scroll support and dynamic metadata.
 */

import { getFilteredProducts } from "@/lib/actions/store/queries/get-filtered-products"
import { ProductGrid } from "@/components/store/home/product-grid"
import { createServerClient } from "@/lib/database/supabase/server"
import { notFound } from "next/navigation"
import { cookies } from "next/headers"
import { getTranslations } from "next-intl/server"
import { appConfig } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"

interface CategoryPageProps {
  params: Promise<{ slug: string; locale: string }>
}

// دالة لتوليد الميتا داتا ديناميكياً استناداً إلى اسم التصنيف واللغة
export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug, locale } = await params
  const supabase = await createServerClient()
  const t = await getTranslations({ locale, namespace: "Category" })

  const { data: category } = await supabase
    .from("categories")
    .select("name")
    .eq("slug", slug)
    .single()

  const categoryName = category?.name || "Category"

  return createMetadata({
    siteName: appConfig.name,
    title: t("META_TITLE", { category: categoryName, default: `${categoryName} Products` }),
    description: t("META_DESCRIPTION", {
      category: categoryName,
      default: `Browse our collection of ${categoryName} items and everyday essentials.`,
    }),
  })
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug, locale } = await params
  const t = await getTranslations({ locale, namespace: "Category" })
  const supabase = await createServerClient()

  // 1. جلب التصنيف بالـ slug لنحصل على الـ id الخاص به والاسم
  const { data: category, error } = await supabase
    .from("categories")
    .select("id, name")
    .eq("slug", slug)
    .single()

  if (error || !category) {
    notFound()
  }

  const categoryId = category.id

  // 2. جلب الكوكيز لتحديد عرض الشبكة أو القائمة
  const cookieStore = await cookies()
  const viewModeCookie = cookieStore.get("store_product_view_mode")?.value
  const viewMode = (viewModeCookie === "list" ? "list" : "grid") as
    | "grid"
    | "list"

  const PAGE_LIMIT = 12

  // 3. جلب المنتجات الأولية باستخدام دالتك الجديدة
  const productsResult = await getFilteredProducts({
    categoryId: categoryId,
    limit: PAGE_LIMIT,
    page: 1,
    activeOnly: true,
  })

  const initialProducts = productsResult.success ? productsResult.data : []

  // 4. Server Action للتحميل التلقائي (Infinite Scroll)
  async function loadMoreProducts(pageNumber: number) {
    "use server"
    const res = await getFilteredProducts({
      categoryId: categoryId,
      limit: PAGE_LIMIT,
      page: pageNumber,
      activeOnly: true,
    })
    return {
      success: res.success,
      data: res.success ? res.data : [],
      hasMore: res.success && res.data ? res.data.length === PAGE_LIMIT : false,
    }
  }

  return (
    <div className="container space-y-8 py-8">
      <ProductGrid
        title={category.name}
        description={t("PAGE_DESC", { category: category.name, default: `Explore all available products in ${category.name}` })}
        viewMode={viewMode}
        initialProducts={initialProducts}
        emptyMessage={t("NO_PRODUCTS", { default: "No products available in this category." })}
        fetchMoreAction={loadMoreProducts}
      />
    </div>
  )
}