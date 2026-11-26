/**
 * @file app/[locale]/layout.tsx
 * @description Root layout wrapping the entire app with global providers, themes, and server-fetched state.
 */

import type { Metadata, Viewport } from "next"
import { notFound } from "next/navigation"
import { IBM_Plex_Sans_Arabic } from "next/font/google"
import { NextIntlClientProvider, hasLocale } from "next-intl"

import "../globals.css"
import { routing } from "@/i18n/routing"
import { cn } from "@/lib/utils"

import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { DirectionProvider } from "@/components/ui/direction"
import { ScrollToTop } from "@/components/shared/scroll-to-top"

import { UserProvider } from "@/lib/context/user-context"
import { getCurrentUser } from "@/lib/actions/users/queries/get-current-user"
import { cookies } from "next/headers"
import { COOKIES_KEYS } from "@/lib/config/app_config"

import { CurrencyProvider } from "@/lib/context/currency-context"
import { getStoreExchangeRate } from "@/lib/actions/store/queries/get-exchange-rate"
import { WishlistProvider } from "@/lib/context/wishlist-context"
import { CartProvider } from "@/lib/context/cart-context"
import { getWishlistProductIds } from "@/lib/actions/wishlists"
import { getCart } from "@/lib/actions/cart"
import type { AppLocale } from "@/i18n/routing"
import ScreenSizeIndicator from "@/components/shared/screen_size_indicator"

const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-plex-arabic",
})

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  manifest: "/manifest.json",
}

interface RootLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function RootLayout({
  children,
  params,
}: RootLayoutProps) {
  const { locale } = await params
  const typedLocale = locale as AppLocale
  const cookieStore = await cookies()

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  const isRtl = ["ar", "fa", "ur", "he"].includes(locale)
  const dir = isRtl ? "rtl" : "ltr"

  const initialTheme =
    cookieStore.get(COOKIES_KEYS.APP_THEME)?.value || "system"
  const isDark = initialTheme === "dark"

  // 1. Fetch current authenticated user
  const currentUserResult = await getCurrentUser()
  const currentUser = currentUserResult.success ? currentUserResult.data : null
  const permissions = currentUser?.permissions || []

  // 2. Fetch store exchange rate from database (USD -> SYP new unit)
  const exchangeRateResult = await getStoreExchangeRate("USD", "new")
  const exchangeRateData = exchangeRateResult.ok ? exchangeRateResult.rate : null

  const savedCurrency = cookieStore.get(COOKIES_KEYS.CURRENCY)?.value || "USD"

  // 3. Fetch wishlist product IDs
  const wishlistResult = await getWishlistProductIds()
  const wishlistIds = wishlistResult.success ? wishlistResult.data : []

  // 4. Fetch initial shopping cart state
  const cartResult = await getCart()
  const initialCart = cartResult.success ? cartResult.data : null

  return (
    <html
      lang={locale}
      dir={dir}
      suppressHydrationWarning
      className={cn("antialiased", plexArabic.variable, isDark && "dark")}
    >
      <body>
        <ThemeProvider initialTheme={initialTheme}>
          <NextIntlClientProvider>
            <TooltipProvider>
              <ScrollToTop />
              <UserProvider user={currentUser} permissions={permissions}>
                <DirectionProvider dir={dir}>
                  <CurrencyProvider
                    exchangeRateData={exchangeRateData}
                    defaultCurrencyCode={savedCurrency}
                    locale={typedLocale}
                  >
                    <WishlistProvider initialWishlistIds={wishlistIds}>
                      <CartProvider initialCart={initialCart}>
                        {children}
                      </CartProvider>
                    </WishlistProvider>
                  </CurrencyProvider>
                </DirectionProvider>
              </UserProvider>
            </TooltipProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
        <Toaster />
        {/* <ScreenSizeIndicator /> */}
      </body>
    </html>
  )
}