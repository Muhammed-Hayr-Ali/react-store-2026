/**
 * @file app/[locale]/(store)/categories/[slug]/page.tsx
 * @description Category storefront page displaying filtered products with infinite scroll support and dynamic metadata.
 */

import { notFound } from "next/navigation"
import { cookies } from "next/headers"
import { getTranslations } from "next-intl/server"

import { getFilteredProducts } from "@/lib/actions/store/queries/get-filtered-products"
import { ProductGrid } from "@/components/store/home/product-grid"
import { APP_CONFIG, COOKIES_KEYS, PRODUCT_MODE } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"
import { getCategoryBySlug } from "@/lib/actions/categories/queries/get-category-by-slug"

interface CategoryPageProps {
  params: Promise<{ slug: string; locale: string }>
}

/**
 * دالة لتوليد الميتا داتا ديناميكياً استناداً إلى اسم التصنيف واللغة
 */
export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug, locale } = await params
  const t = await getTranslations({ locale, namespace: "Category" })

  const result = await getCategoryBySlug(slug)

  let name

  if (result.success) name = result.data.name

  const categoryName = name ?? "Category"

  return createMetadata({
    siteName: APP_CONFIG.NAME,
    title: t("META_TITLE", {
      category: categoryName,
      default: `${categoryName} Products`,
    }),
    description: t("META_DESCRIPTION", {
      category: categoryName,
      default: `Browse our collection of ${categoryName} items and everyday essentials.`,
    }),
  })
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug, locale } = await params
  const t = await getTranslations({ locale, namespace: "Category" })

  const cookieStore = await cookies()
  const viewModeCookie = cookieStore.get(COOKIES_KEYS.PRODUCT_MODE)?.value
  const viewMode =
    viewModeCookie === PRODUCT_MODE.LIST ? PRODUCT_MODE.LIST : PRODUCT_MODE.GRID

  const result = await getCategoryBySlug(slug)

  if (!result.success || !result.data) {
    notFound()
  }

  const category = result.data

  const categoryId = category.slug === "*" ? undefined : category.id
  const PAGE_LIMIT = 12

  // 3. جلب المنتجات الأولية
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
        description={t("PAGE_DESC", {
          category: category.name,
          default: `Explore all available products in ${category.name}`,
        })}
        viewMode={viewMode}
        initialProducts={initialProducts}
        emptyMessage={t("NO_PRODUCTS", {
          default: "No products available in this category.",
        })}
        fetchMoreAction={loadMoreProducts}
      />
    </div>
  )
}
