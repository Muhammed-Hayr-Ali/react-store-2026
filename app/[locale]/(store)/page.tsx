/**
 * @file app/[locale]/(store)/page.tsx
 * @description Storefront home page displaying the featured hero slider, root categories, and latest regular products grid.
 */


import { getRootCategories } from "@/lib/actions/store/queries/get-root-categories"
import FeaturedHeroSlider from "@/components/store/home/featured-hero-slider"

import { APP_CONFIG, COOKIES_KEYS, PRODUCT_MODE } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"
import { cookies } from "next/headers"
import { getTranslations } from "next-intl/server"
import SearchBar from "@/components/store/home/search-bar"
import MainSection from "@/components/store/home/main_section"
import { getFilteredProducts } from "@/lib/actions/store/queries/get_filtered_products"

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

  const PAGE_LIMIT = 12 // عدد المنتجات في الدفعة الأولى وعند التمرير

  const [featuredResult, latestResult, categoriesResult] = await Promise.all([
    getFilteredProducts({ limit: 5, activeOnly: true }),
    getFilteredProducts({ limit: PAGE_LIMIT, page: 1, activeOnly: true }),
    getRootCategories(),
  ])

  const slides = featuredResult.success ? featuredResult.data : []
  const initialProducts = latestResult.success ? latestResult.data : []
  const categories = categoriesResult.success ? categoriesResult.data : []

  // Server Action لجلب الدفعات التالية تلقائياً عند التمرير
  async function loadMoreProducts(pageNumber: number) {
    "use server"
    const res = await getFilteredProducts({
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
    <div className="space-y-6 pt-4 lg:pt-8">
      {/* SearchBar */}
      <SearchBar />
      {/* 1. السلايدر التفاعلي للمنتجات المميزة */}
      <FeaturedHeroSlider slides={slides} />

      {/* 2. شريط التصنيفات الرئيسية */}
      <MainSection
        viewMode={viewMode}
        initialProducts={initialProducts}
        fetchMoreAction={loadMoreProducts}
        categories={categories}
      />
    </div>
  )
}
