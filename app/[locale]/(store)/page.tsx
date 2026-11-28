/**
 * @file app/[locale]/(store)/page.tsx
 * @description Storefront home page displaying the featured hero slider, root categories, and latest products grid.
 */

import { Suspense } from "react"

import FeaturedHeroSlider from "@/components/store/featured-hero-slider/featured-hero-slider"
import { FeaturedHeroSliderSkeleton } from "@/components/store/featured-hero-slider/featured-hero-slider-skeleton"
import CategoryCarousel from "@/components/store/shop-by-category-slider/category-carousel"
import { CategoryCarouselSkeleton } from "@/components/store/shop-by-category-slider/category-carousel-skeleton"
import { LatestProductsSection } from "@/components/store/latest-products/latest-products-section"
import { LatestProductsSkeleton } from "@/components/store/latest-products/latest-products-skeleton"
import { STORE_CONTAINER } from "@/lib/config/app_config"

export default function HomePage() {
  return (
    <main id="main-content" className="w-full flex-1">
      {/* الحاوية نفسها المستخدمة في الهيدر والفوتر */}
      <div
        className={`${STORE_CONTAINER} space-y-8 py-4 md:space-y-12 md:py-6`}
      >
        {/* 1. سلايدر المنتجات المميزة */}
        <Suspense fallback={<FeaturedHeroSliderSkeleton />}>
          <FeaturedHeroSlider />
        </Suspense>

        {/* 2. شريط التصنيفات الرئيسية */}
        <Suspense fallback={<CategoryCarouselSkeleton />}>
          <CategoryCarousel />
        </Suspense>

        {/* 3. أحدث المنتجات */}
        <Suspense fallback={<LatestProductsSkeleton showViewAll />}>
          <LatestProductsSection viewAllHref="/products" />
        </Suspense>
      </div>
    </main>
  )
}