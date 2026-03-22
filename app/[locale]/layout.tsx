import "../globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { Geist_Mono, Inter, Cairo } from "next/font/google"
import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"
import { routing } from "@/i18n/routing"
import { Toaster } from "sonner"
import { Viewport, Metadata } from "next"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AuthProvider } from "@/lib/providers/auth-provider"
import { AuthDebug } from "@/components/debug/auth-debug"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
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

// kjl

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params
  const messages = await getMessages()

  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        locale === "ar" ? cairo.variable : inter.variable,
        locale === "ar" ? "font-arabic" : "font-sans"
      )}
    >
      <body>
        <AuthProvider>
          <TooltipProvider>
            <NextIntlClientProvider messages={messages}>
              <ThemeProvider>
                <AuthProvider>{children}</AuthProvider>
                <Toaster position="top-center" richColors />
              </ThemeProvider>
            </NextIntlClientProvider>
          </TooltipProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
