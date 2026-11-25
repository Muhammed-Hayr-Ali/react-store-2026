/**
 * @file app/[locale]/(store)/page.tsx
 * @description Storefront home page displaying the featured hero slider, root categories, and latest regular products grid.
 */

import FeaturedHeroSlider from "@/components/store/featured-hero-slider/featured-hero-slider"

import { APP_CONFIG, COOKIES_KEYS, PRODUCT_MODE } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"
import { cookies } from "next/headers"
import { getTranslations } from "next-intl/server"
import { getFilteredProducts } from "@/lib/actions/store/queries/get_filtered_products"
import HomeClientWrapper from "@/components/store/client-wrapper/home-client-wrapper"
import { StoreHeader } from "@/components/store/store-header/store-header"
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

  const [categoriesResult, featuredResult, latestResult] = await Promise.all([
    getAllCategories(),
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
  ])

  const categories = categoriesResult.success ? categoriesResult.data : []
  const slides = featuredResult.success ? featuredResult.data : []
  const initialProducts = latestResult.success ? latestResult.data : []

  return (
    <>
      <StoreHeader categories={categories} />

      {/* 3. المحتوى الرئيسي */}
      <main id="main-content" className="w-full flex-1">
        {/* حاوية المحتوى: max-w-7xl هي المعيار العالمي لعرض المحتوى مع هوامش متجاوبة */}
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
          {/* 1. السلايدر التفاعلي للمنتجات المميزة */}
          <FeaturedHeroSlider slides={slides} />

          {/* 2. شريط التصنيفات الرئيسية */}
          <HomeClientWrapper
            viewMode={viewMode}
            initialProducts={initialProducts}
            categories={categories}
          />
        </div>
      </main>

      {/* 4. الفوتر */}
      <footer className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {/* شبكة روابط الفوتر: تتجاوب من عمود واحد إلى 4 أعمدة */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <h3 className="mb-4 text-lg font-semibold">عن المتجر</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                وصف مختصر عن المتجر ورسالته للعملاء.
              </p>
            </div>
            {/* يمكنك إضافة أعمدة أخرى للروابط والدعم هنا */}
          </div>

          {/* حقوق الملكية والسوشيال ميديا */}
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-sm text-muted-foreground sm:flex-row">
            <p>© {new Date().getFullYear()} Store. جميع الحقوق محفوظة.</p>
            <div className="flex gap-4">{/* أيقونات السوشيال ميديا هنا */}</div>
          </div>
        </div>
      </footer>
    </>
  )
}
