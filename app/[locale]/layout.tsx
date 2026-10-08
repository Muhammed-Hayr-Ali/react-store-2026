import type { Metadata, Viewport } from "next"
import { notFound } from "next/navigation"
import { Geist_Mono, Inter, Rubik } from "next/font/google"
import { NextIntlClientProvider, hasLocale } from "next-intl"

import "../globals.css"
import { routing } from "@/i18n/routing"
import { cn } from "@/lib/utils"

import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { DirectionProvider } from "@/components/ui/direction"
import { ScrollToTop } from "@/components/shared/scroll-to-top"

import { CurrencyProvider } from "@/lib/context/currency-context"
import { UserProvider } from "@/lib/context/user-context"
import { getCurrencyContext } from "@/lib/actions/currency/queries/get-currency-context"
import { getCurrentUser } from "@/lib/actions/users/queries/get-current-user"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const rubik = Rubik({
  subsets: ["latin"],
  variable: "--font-rubik",
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

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  const direction = locale === "ar" ? "rtl" : "ltr"

  // جلب سياق العملة والمستخدم الحالي بالتوازي لتحقيق أسرع استجابة خادمة
  const [{ currency, rate }, currentUser] = await Promise.all([
    getCurrencyContext(),
    getCurrentUser(),
  ])

  const permissions = currentUser?.permissions || []

  return (
    <html
      lang={locale}
      dir={direction}
      suppressHydrationWarning
      className={cn(
        "antialiased",
        rubik.className,
        fontMono.variable,
        inter.variable,
        "font-sans"
      )}
    >
      <body className="min-h-screen bg-background font-sans text-foreground">
        <DirectionProvider dir={direction}>
          <ThemeProvider>
            <NextIntlClientProvider>
              <TooltipProvider>
                <ScrollToTop />
                <CurrencyProvider currency={currency} rate={rate}>
                  <UserProvider user={currentUser} permissions={permissions}>
                    {children}
                  </UserProvider>
                </CurrencyProvider>
              </TooltipProvider>
            </NextIntlClientProvider>
          </ThemeProvider>
          <Toaster />
        </DirectionProvider>
      </body>
    </html>
  )
}