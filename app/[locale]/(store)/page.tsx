/**
 * @file app/[locale]/(store)/page.tsx
 * @description Storefront home page displaying the featured products slider.
 */

import { getFeaturedProducts } from "@/lib/actions/store/queries/get-featured-products"
import FeaturedHeroSlider from "@/components/store/home/featured-hero-slider"
import { appConfig } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"

// import { Wrench } from "lucide-react"

export async function generateMetadata() {
  return createMetadata({
    siteName: appConfig.name,
    title: "Home",
    description: "Welcome to our store. Discover our featured products.",
  })
}

export default async function Page() {
  // جلب المنتجات المتميزة للسلايدر
  const result = await getFeaturedProducts({ limit: 5, activeOnly: true })
  const slides = result.success ? result.data : []

  return (
    <div className="space-y-6 pb-10">
      {/* عرض السلايدر التفاعلي للمنتجات المميزة */}
      <FeaturedHeroSlider slides={slides} />

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
    </div>
  )
}