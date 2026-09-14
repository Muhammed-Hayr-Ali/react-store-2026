import { Geist_Mono, Inter, Rubik } from "next/font/google"

import "../globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { NextIntlClientProvider, hasLocale } from "next-intl"

import { notFound } from "next/navigation"
import { routing } from "@/i18n/routing"
import { Metadata, Viewport } from "next"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { DirectionProvider } from "@/components/ui/direction"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const rubik = Rubik({ subsets: ["latin"], variable: "--font-rubik" })

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  manifest: "/manifest.json",
}

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function RootLayout({ children, params }: Props) {
  const { locale } = await params
  const direction = locale === "ar" ? "rtl" : "ltr"

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  return (
    <html
      lang={locale}
      dir={direction}
      suppressHydrationWarning
      className={cn(
        "antialiased",
        rubik.className,
        fontMono.variable,
        "font-sans",
        inter.variable
      )}
    >
      <body>
        <DirectionProvider dir={direction}>
          <ThemeProvider>
            <NextIntlClientProvider>
              <TooltipProvider>
                <main>{children}</main>
              </TooltipProvider>
            </NextIntlClientProvider>
          </ThemeProvider>
          <Toaster />
        </DirectionProvider>
      </body>
    </html>
  )
}
