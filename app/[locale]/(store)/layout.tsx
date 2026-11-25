/**
 * @file app/[locale]/(store)/layout.tsx
 * @description Main storefront layout with sticky top navbar, scrollable content, footer, and a Tailwind-gradient fading bottom navigation for mobile.
 */

import * as React from "react"
import Navbar from "@/components/store/navbar/navbar"
import Footer from "@/components/store/footer/footer"
import { StoreHeader } from "@/components/store/store-header/store-header"

interface StoreLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // الحاوية الجذرية: تستخدم flex لضمان بقاء الفوتر في الأسفل، وتدعم الثيمات الفاتحة والداكنة
    <div className="relative flex min-h-screen flex-col bg-background text-foreground antialiased">
      {/* 1. رابط تخطي إلى المحتوى (معيار عالمي للوصول - Accessibility) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:inset-s-4 focus:top-4 focus:z-100 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-lg"
      >
        تخطي إلى المحتوى الرئيسي
      </a>

      {/* 2. الهيدر (Navbar) */}
      {/* <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
           <div className="flex items-center gap-2">
            <p className="text-xl font-bold tracking-tight">Logo</p>
          </div>

           <nav className="flex items-center gap-4">
             <p className="text-sm font-medium">Navbar</p>
          </nav>
        </div>
      </header> */}

      <StoreHeader />

      {/* 3. المحتوى الرئيسي */}
      <main id="main-content" className="w-full flex-1">
        {/* حاوية المحتوى: max-w-7xl هي المعيار العالمي لعرض المحتوى مع هوامش متجاوبة */}
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
          {children}
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
    </div>
  )
}
