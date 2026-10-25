/**
 * @file app/[locale]/(store)/page.tsx
 * @description Storefront home page displaying the featured hero slider, root categories, and latest regular products grid.
 */

import { getFeaturedProducts } from "@/lib/actions/store/queries/get-featured-products"
import { getLatestRegularProducts } from "@/lib/actions/store/queries/get-latest-regular-products"
import { getRootCategories } from "@/lib/actions/store/queries/get-root-categories"
import FeaturedHeroSlider from "@/components/store/home/featured-hero-slider"
import CategoriesScroll from "@/components/store/home/categories-scroll"
import { appConfig } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"
import { ProductGrid } from "@/components/store/home/product-grid"

export async function generateMetadata() {
  return createMetadata({
    siteName: appConfig.name,
    title: "Home",
    description:
      "Welcome to our store. Discover our featured products, categories, and latest arrivals.",
  })
}

export default async function Page() {
  // جلب المنتجات المميزة، أحدث المنتجات، والتصنيفات الرئيسية بشكل متزامن (بالتوازي) لضمان أعلى أداء
  const [featuredResult, latestResult, categoriesResult] = await Promise.all([
    getFeaturedProducts({ limit: 5, activeOnly: true }),
    getLatestRegularProducts({ limit: 30, activeOnly: true }),
    getRootCategories({ limit: 10 }),
  ])

  const slides = featuredResult.success ? featuredResult.data : []
  const latestProducts = latestResult.success ? latestResult.data : []
  const categories = categoriesResult.success ? categoriesResult.data : []

  return (
    <div className="space-y-12 pb-12">
      {/* 1. عرض السلايدر التفاعلي للمنتجات المميزة */}
      <FeaturedHeroSlider slides={slides} />

      {/* 2. عرض شريط التصنيفات الرئيسية المتحرك */}
      <CategoriesScroll categories={categories} />

      {/* 3. عرض شبكة أحدث المنتجات (غير المميزة) */}
      <ProductGrid 
            products={latestProducts} 
            emptyMessage="No new products available right now." 
          />
    </div>
  )
}