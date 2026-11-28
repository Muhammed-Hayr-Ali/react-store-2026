/**
 * @file app/[locale]/(store)/layout.tsx
 * @description Main storefront layout with sticky top navbar, scrollable content, footer, and responsive spacing.
 */

import { Suspense } from "react"
import { getTranslations } from "next-intl/server"

import { cn } from "@/lib/utils"
import { StoreFooter } from "@/components/store/store-footer/store-footer"
import { StoreHeader } from "@/components/store/store-header/store-header"
import { StoreHeaderSkeleton } from "@/components/store/store-header/store-header-skeleton"
import { STORE_CONTAINER } from "@/lib/config/app_config"

interface StoreLayoutProps {
  children: React.ReactNode
}

export default async function StoreLayout({ children }: StoreLayoutProps) {
  const t = await getTranslations("StoreLayout")

  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-clip bg-background text-foreground antialiased selection:bg-primary/15 selection:text-primary">
      {/* 1. رابط تخطي إلى المحتوى الرئيسي للوصولية */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:inset-s-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-primary focus:px-4 focus:py-2.5 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow-lg focus:outline-none"
      >
        {t("skipToContent")}
      </a>

      {/* 2. الهيدر: يجلب بياناته بنفسه */}
      <Suspense fallback={<StoreHeaderSkeleton />}>
        <StoreHeader />
      </Suspense>

      {/* 3. المحتوى الرئيسي */}
      <main id="main-content" tabIndex={-1} className="w-full flex-1 outline-none">
        <div
          className={cn(
            STORE_CONTAINER,
            "space-y-8 py-4 md:space-y-12 md:py-6"
          )}
        >
          {children}
        </div>
      </main>

      {/* 4. الفوتر */}
      <StoreFooter />
    </div>
  )
}