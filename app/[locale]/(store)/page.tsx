/**
 * @file app/[locale]/(store)/page.tsx
 * @description Storefront home page displaying the featured hero slider, root categories, and latest regular products grid.
 */

import { getFeaturedProducts } from "@/lib/actions/store/queries/get-featured-products"
import { getLatestRegularProducts } from "@/lib/actions/store/queries/get-latest-regular-products"
import { getRootCategories } from "@/lib/actions/store/queries/get-root-categories"
import FeaturedHeroSlider from "@/components/store/home/featured-hero-slider"
import CategoriesScroll from "@/components/store/home/categories-scroll"
import { ProductGrid } from "@/components/store/home/product-grid"
import { appConfig } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"
import { cookies } from "next/headers"

export async function generateMetadata() {
  return createMetadata({
    siteName: appConfig.name,
    title: "Home",
    description:
      "Welcome to our store. Discover our featured products, categories, and latest arrivals.",
  })
}

export default async function Page() {
  const cookieStore = await cookies()
  // viewMode: "grid" | "list"
  const viewModeCookie = cookieStore.get("store_product_view_mode")?.value
  const viewMode = (viewModeCookie === "list" ? "list" : "grid") as
    | "grid"
    | "list"

  const PAGE_LIMIT = 12 // عدد المنتجات في الدفعة الأولى وعند التمرير

  const [featuredResult, latestResult, categoriesResult] = await Promise.all([
    getFeaturedProducts({ limit: 5, activeOnly: true }),
    getLatestRegularProducts({ limit: PAGE_LIMIT, page: 1, activeOnly: true }),
    getRootCategories({ limit: 10 }),
  ])

  const slides = featuredResult.success ? featuredResult.data : []
  const initialProducts = latestResult.success ? latestResult.data : []
  const categories = categoriesResult.success ? categoriesResult.data : []

  // Server Action لجلب الدفعات التالية تلقائياً عند التمرير
  async function loadMoreProducts(pageNumber: number) {
    "use server"
    const res = await getLatestRegularProducts({
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
    <div className="space-y-12 pb-12">
      {/* 1. السلايدر التفاعلي للمنتجات المميزة */}
      <FeaturedHeroSlider slides={slides} />

      {/* 2. شريط التصنيفات الرئيسية */}
      <CategoriesScroll categories={categories} />

      {/* 3. شبكة المنتجات مع التحميل التلقائي (Infinite Scroll) */}
      <ProductGrid
        viewMode={viewMode}
        initialProducts={initialProducts}
        emptyMessage="No new products available right now."
        fetchMoreAction={loadMoreProducts}
      />
    </div>
  )
}