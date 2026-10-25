/**
 * @file app/[locale]/(store)/page.tsx
 * @description Storefront home page displaying the featured products slider and root categories.
 */

import { getFeaturedProducts } from "@/lib/actions/store/queries/get-featured-products"
import { getRootCategories } from "@/lib/actions/store/queries/get-root-categories"
import FeaturedHeroSlider from "@/components/store/home/featured-hero-slider"
import CategoriesScroll from "@/components/store/home/categories-scroll"
import { appConfig } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"

// import { Wrench } from "lucide-react"

export async function generateMetadata() {
  return createMetadata({
    siteName: appConfig.name,
    title: "Home",
    description:
      "Welcome to our store. Discover our featured products and categories.",
  })
}

export default async function Page() {
  // جلب المنتجات المتميزة والتصنيفات الرئيسية بشكل متزامن (بالتوازي) لتحسين الأداء
  const [featuredResult, categoriesResult] = await Promise.all([
    getFeaturedProducts({ limit: 5, activeOnly: true }),
    getRootCategories({ limit: 10 }),
  ])

  const slides = featuredResult.success ? featuredResult.data : []
  const categories = categoriesResult.success ? categoriesResult.data : []

  return (
    <main>
      {/* عرض السلايدر التفاعلي للمنتجات المميزة */}
      <FeaturedHeroSlider slides={slides} />

      {/* عرض شريط التصنيفات الرئيسية المتحرك */}
      <CategoriesScroll categories={categories} />

      {/* 
      === تم تعليق صفحة الصيانة المؤقتة بناءً على الطلب ===
      <div className="flex min-h-[70vh] flex-col items-center justify-center space-y-6 px-4 text-center">
        <div className="flex size-32 items-center justify-center rounded-[50%] corner-squircle bg-muted p-6">
          <Wrench className="size-full text-muted-foreground" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Under Maintenance
          </h1>
          <p className="max-w-125 text-lg text-muted-foreground">
            We are currently performing scheduled maintenance to improve your
            experience. We&apos;ll be back online shortly. Thank you for your
            patience!
          </p>
        </div>
      </div>
      */}
    </main>
  )
}
