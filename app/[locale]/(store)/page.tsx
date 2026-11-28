/**
 * @file app/[locale]/(store)/page.tsx
 * @description Storefront home page displaying the featured hero slider, root categories, and latest regular products grid.
 */

import FeaturedHeroSlider from "@/components/store/featured-hero-slider/featured-hero-slider"

import {
  APP_CONFIG,
  COOKIES_KEYS,
  PRODUCT_MODE,
  STORE_CONTAINER,
} from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"
import { cookies } from "next/headers"
import { getTranslations } from "next-intl/server"
import { getFilteredProducts } from "@/lib/actions/store/queries/get_filtered_products"
import HomeClientWrapper from "@/components/store/client-wrapper/home-client-wrapper"
import { cn } from "@/lib/utils"
import { getStoreExchangeRate } from "@/lib/actions/store/queries/get-exchange-rate"
import CategoryCarousel from "@/components/store/shop-by-category-slider/shop-by-category-slider"
import { getAllCategories } from "@/lib/actions/store/queries/get-all-categories"

interface PageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Home" })

  return createMetadata({
    siteName: APP_CONFIG.NAME,
    title: t("META_TITLE"),
    description: t("META_DESCRIPTION"),
  })
}

export default async function Page() {
  const cookieStore = await cookies()

  const viewModeCookie = cookieStore.get(COOKIES_KEYS.PRODUCT_MODE)?.value
  const viewMode =
    viewModeCookie === PRODUCT_MODE.LIST ? PRODUCT_MODE.LIST : PRODUCT_MODE.GRID

  const FEATURED_PRODUCTS = true
  const FEATURED_LIMET = 5
  const LATEST_LIMIT = 12
  const PAGE_NUMBER = 1
  const ACTIVE_ONLY = true

  const exchangeRate = getStoreExchangeRate("USD", "new")

  const [featuredResult, categoriesResult, latestResult] = await Promise.all([
    getFilteredProducts({
      limit: FEATURED_LIMET,
      page: PAGE_NUMBER,
      activeOnly: ACTIVE_ONLY,
      is_featured: FEATURED_PRODUCTS,
    }),
    getAllCategories(),
    getFilteredProducts({
      limit: LATEST_LIMIT,
      page: PAGE_NUMBER,
      activeOnly: ACTIVE_ONLY,
      is_featured: false,
    }),
  ])

  const slides = featuredResult.success ? featuredResult.data : []
  const categories = categoriesResult.success ? categoriesResult.data : []
  const initialProducts = latestResult.success ? latestResult.data : []
  const resolvedExchangeRate = await exchangeRate

  return (
    <>
      {/* 3. المحتوى الرئيسي */}
      <main id="main-content" className="w-full flex-1">
        {/* الحاوية نفسها المستخدمة في الهيدر والفوتر */}
        <div
          className={cn(
            STORE_CONTAINER,
            "space-y-8 py-4 md:space-y-12 md:py-6"
          )}
        >
          {/* 1. السلايدر التفاعلي للمنتجات المميزة */}
          <FeaturedHeroSlider
            slides={slides}
            exchangeRate={resolvedExchangeRate}
          />

          {/* 2. شريط التصنيفات الرئيسية */}
          <CategoryCarousel categories={categories} />

          {/* 2. شريط التصنيفات الرئيسية */}
          <HomeClientWrapper
            viewMode={viewMode}
            initialProducts={initialProducts}
          />
        </div>
      </main>
    </>
  )
}
