import type { Metadata, Viewport } from "next"
import { notFound } from "next/navigation"
import { Geist_Mono, Rubik } from "next/font/google"
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

const rubik = Rubik({
  subsets: ["arabic", "latin"],
  variable: "--font-sans",
  display: "swap",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
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
  const cookieStore = await cookies()
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  const isRtl = ["ar", "fa", "ur", "he"].includes(locale)
  const dir = isRtl ? "rtl" : "ltr"

  // التصحيح هنا: قراءة الكوكي بالقيمة الصحيحة مع افتراضي "system"
  const initialTheme = cookieStore.get(COOKIES_KEYS.APP_THEME)?.value || "system"
  
  // تحديد ما إذا كان الكلاس الأولي يجب أن يكون dark لمنع الوميض
  const isDark = initialTheme === "dark"

  const currentUserResult = await getCurrentUser()
  const currentUser = currentUserResult.success ? currentUserResult.data : null

  const permissions = currentUser?.permissions || []

  return (
    <html
      lang={locale}
      dir={dir}
      suppressHydrationWarning
      // حقن كلاس dark مسبقاً من السيرفر لمنع وميض الشاشة الأبيض
      className={cn("antialiased", rubik.variable, fontMono.variable, isDark && "dark")}
    >
      <body>
        <ThemeProvider initialTheme={initialTheme}>
          <NextIntlClientProvider>
            <TooltipProvider>
              <ScrollToTop />
              <UserProvider user={currentUser} permissions={permissions}>
                <DirectionProvider dir={dir}>{children}</DirectionProvider>
              </UserProvider>
            </TooltipProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  )
}