/**
 * @file app/[locale]/(store)/page.tsx
 * @description Storefront home page displaying the featured hero slider, root categories, and latest regular products grid.
 */

import { getRootCategories } from "@/lib/actions/store/queries/get-root-categories"
import FeaturedHeroSlider from "@/components/store/featured-hero-slider/featured-hero-slider"

import { APP_CONFIG, COOKIES_KEYS, PRODUCT_MODE } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"
import { cookies } from "next/headers"
import { getTranslations } from "next-intl/server"
import SearchBar from "@/components/store/search-bar/search-bar"
import { getFilteredProducts } from "@/lib/actions/store/queries/get_filtered_products"
import HomeClientWrapper from "@/components/store/client-wrapper/home-client-wrapper"

interface PageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Home" })

  return createMetadata({
    siteName: APP_CONFIG.NAME,
    title: t("META_TITLE", { default: "Home" }),
    description: t("META_DESCRIPTION", {
      default:
        "Welcome to our store. Discover our featured products, categories, and latest arrivals.",
    }),
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

  const [featuredResult, latestResult, categoriesResult] = await Promise.all([
    getFilteredProducts({
      limit: FEATURED_LIMET,
      page: PAGE_NUMBER,
      activeOnly: ACTIVE_ONLY,
      is_featured: FEATURED_PRODUCTS,
    }),
    getFilteredProducts({
      limit: LATEST_LIMIT,
      page: PAGE_NUMBER,
      activeOnly: ACTIVE_ONLY,
      is_featured: false,
    }),
    getRootCategories(),
  ])

  const slides = featuredResult.success ? featuredResult.data : []
  const initialProducts = latestResult.success ? latestResult.data : []
  const categories = categoriesResult.success ? categoriesResult.data : []

  return (
    <div className="space-y-6 py-4 md:py-6 lg:py-8">
      {/* SearchBar */}
      <SearchBar />

      {/* 1. السلايدر التفاعلي للمنتجات المميزة */}
      <FeaturedHeroSlider slides={slides} />

      {/* 2. شريط التصنيفات الرئيسية */}
      <HomeClientWrapper
        viewMode={viewMode}

        initialProducts={initialProducts}
        // fetchMoreAction={loadMoreProducts}
        categories={categories}
      />
    </div>
  )
}
