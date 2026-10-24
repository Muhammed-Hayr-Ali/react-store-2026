/**
 * @file app/[locale]/(store)/layout.tsx
 * @description Main storefront layout with Navbar, Footer, Multi-Currency Provider, Wishlist Provider, and Cart Provider.
 */

import * as React from "react"
import { cookies } from "next/headers"
import { createServerClient } from "@/lib/database/supabase/server"
import { CurrencyProvider } from "@/lib/context/currency-context"
import { WishlistProvider } from "@/lib/context/wishlist-context"
import { CartProvider } from "@/lib/context/cart-context"
import { getWishlistProductIds } from "@/lib/actions/wishlists"
import { getCart } from "@/lib/actions/cart"
import Navbar from "@/components/store/navbar/navbar"
import Footer from "@/components/store/footer/footer"
import type { AppLocale } from "@/i18n/routing"

interface MainLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function MainLayout({ children, params }: MainLayoutProps) {
  const { locale } = await params
  const typedLocale = locale as AppLocale
  const supabase = await createServerClient()

  // 1. جلب العملات المفعلة من قاعدة البيانات
  const { data: currencies } = await supabase
    .from("currencies")
    .select("code, name, name_ar, symbol, rate_factor")
    .eq("is_active", true)

  // 2. قراءة العملة المخزنة في الكوكيز أو الاعتماد على USD كافتراضي
  const cookieStore = await cookies()
  const savedCurrency = cookieStore.get("app_currency")?.value || "USD"

  // 3. جلب معرفات المفضلة واستخراج الـ data الصافية
  const wishlistResult = await getWishlistProductIds()
  const wishlistIds = wishlistResult.success ? wishlistResult.data : []

  // 4. جلب سلة المشتريات الأولية للمستخدم الحالي
  const cartResult = await getCart()
  const initialCart = cartResult.success ? cartResult.data : null

  return (
    <CurrencyProvider
      initialCurrencies={currencies || []}
      defaultCurrencyCode={savedCurrency}
      locale={typedLocale}
    >
      <WishlistProvider initialWishlistIds={wishlistIds}>
        <CartProvider initialCart={initialCart}>
          <div className="relative flex min-h-screen flex-col bg-background text-foreground">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </CartProvider>
      </WishlistProvider>
    </CurrencyProvider>
  )
}