/**
 * @file app/[locale]/(store)/brands/[slug]/page.tsx
 * @description Brand storefront page displaying filtered products with infinite scroll support and dynamic metadata.
 */

import { getFilteredProducts } from "@/lib/actions/store/queries/get-filtered-products"
import { ProductGrid } from "@/components/store/home/product-grid"
import { createServerClient } from "@/lib/database/supabase/server"
import { notFound } from "next/navigation"
import { cookies } from "next/headers"
import { getTranslations } from "next-intl/server"
import { appConfig } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"

interface BrandPageProps {
  params: Promise<{ slug: string; locale: string }>
}

// دالة لتوليد الميتا داتا ديناميكياً استناداً إلى اسم البراند واللغة
export async function generateMetadata({ params }: BrandPageProps) {
  const { slug, locale } = await params
  const supabase = await createServerClient()
  const t = await getTranslations({ locale, namespace: "Brand" })

  const { data: brand } = await supabase
    .from("brands")
    .select("name")
    .eq("slug", slug)
    .single()

  const brandName = brand?.name || "Brand"

  return createMetadata({
    siteName: appConfig.name,
    title: t("META_TITLE", { brand: brandName, default: `${brandName} Products` }),
    description: t("META_DESCRIPTION", {
      brand: brandName,
      default: `Explore all products, offers, and latest releases from ${brandName}.`,
    }),
  })
}

export default async function BrandPage({ params }: BrandPageProps) {
  const { slug, locale } = await params
  const t = await getTranslations({ locale, namespace: "Brand" })
  const supabase = await createServerClient()

  // 1. جلب العلامة التجارية بالـ slug لنحصل على الـ id الخاص بها والاسم
  const { data: brand, error } = await supabase
    .from("brands")
    .select("id, name")
    .eq("slug", slug)
    .single()

  if (error || !brand) {
    notFound()
  }

  // تخزين الـ id في ثابت لضمان الأمان ونوع البيانات داخل الـ Server Action
  const brandId = brand.id

  // 2. جلب الكوكيز لتحديد طريقة عرض الشبكة أو القائمة
  const cookieStore = await cookies()
  const viewModeCookie = cookieStore.get("store_product_view_mode")?.value
  const viewMode = (viewModeCookie === "list" ? "list" : "grid") as "grid" | "list"

  const PAGE_LIMIT = 12

  // 3. جلب المنتجات الأولية للعلامة التجارية
  const productsResult = await getFilteredProducts({
    brandId: brandId,
    limit: PAGE_LIMIT,
    page: 1,
    activeOnly: true,
  })

  const initialProducts = productsResult.success ? productsResult.data : []

  // 4. Server Action للتحميل التلقائي (Infinite Scroll)
  async function loadMoreProducts(pageNumber: number) {
    "use server"
    const res = await getFilteredProducts({
      brandId: brandId,
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
    <div className="container py-8 space-y-8">
      <ProductGrid
        title={brand.name}
        description={t("PAGE_DESC", { brand: brand.name, default: `Explore all available products from ${brand.name}` })}
        viewMode={viewMode}
        initialProducts={initialProducts}
        emptyMessage={t("NO_PRODUCTS", { default: "No products available from this brand right now." })}
        fetchMoreAction={loadMoreProducts}
      />
    </div>
  )
}