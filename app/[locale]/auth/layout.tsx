/**
 * @file app/[locale]/(auth)/layout.tsx
 * @description Master authentication layout providing unified card boundaries,
 * localized RTL navigation, and accessible legal compliance footer pinned at the bottom
 * with a seamless inverted gradient background.
 */

import * as React from "react"
import Link from "next/link"
import { getTranslations } from "next-intl/server"

import { appRoutes } from "@/lib/config/app-routes"

interface AuthLayoutProps {
  children: React.ReactNode
  params: Promise<{
    locale: string
  }>
}

export default async function AuthLayout({
  children,
  params,
}: AuthLayoutProps) {
  const { locale } = await params
  const t = await getTranslations("AuthLayout")

  return (
    <main className="flex h-svh w-full flex-col justify-between bg-linear-to-b from-muted/60 via-muted/30 to-background">
      {/* Main Authentication Card Container */}
      <div className="flex w-full flex-1 flex-col items-center justify-center py-10">
        <div className="w-full max-w-sm sm:max-w-md">
          <div className="rounded-2xl border border-border/60 bg-card/95 p-5 sm:p-6">
            {children}
          </div>
        </div>
      </div>

      {/* Legal & Compliance Footer - Pinned at the very bottom */}
      <footer className="w-full shrink-0 text-center">
        <p className="text-[10px] leading-relaxed text-muted-foreground/80 sm:text-[11px]">
          {t("TERMS_PREFIX")}{" "}
          <Link
            href={`/${locale}${appRoutes.terms ?? "#"}`}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {t("TERMS_OF_SERVICE")}
          </Link>{" "}
          {t("TERMS_AND")}{" "}
          <Link
            href={`/${locale}${appRoutes.privacy ?? "#"}`}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {t("PRIVACY_POLICY")}
          </Link>
          {t("TERMS_SUFFIX")}
        </p>
      </footer>
    </main>
  )
}
