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
import { getTranslations } from "next-intl/server"
import { createMetadata } from "@/lib/config/metadata_generator"
import { APP_CONFIG } from "@/lib/config/app_config"
import PromoModal from "@/components/store/promo-modal/promo-modal"

export async function generateMetadata() {
  const t = await getTranslations("Home")

  return createMetadata({
    siteName: APP_CONFIG.NAME,
    title: t("META_TITLE"),
    description: t("META_DESCRIPTION"),
  })
}

export default function HomePage() {
  return (
    <>
      <Suspense fallback={null}>
        <PromoModal />
      </Suspense>
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
    </>
  )
}
