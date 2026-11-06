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
import { FieldDescription } from "@/components/ui/field"

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
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-md flex-col gap-6">
        <div className="flex flex-col gap-6">
          {children}
          <FieldDescription className="px-6 text-center text-[10px] leading-relaxed text-muted-foreground/80">
          {t("TERMS_PREFIX")}{" "}
          <Link
            href={`/${locale}${appRoutes.terms ?? "#"}`}
            className="text-primary underline-offset-4 hover:underline"
          >
            {t("TERMS_OF_SERVICE")}
          </Link>{" "}
          {t("TERMS_AND")}{" "}
          <Link
            href={`/${locale}${appRoutes.privacy ?? "#"}`}
            className="text-primary underline-offset-4 hover:underline"
          >
            {t("PRIVACY_POLICY")}
          </Link>
          {t("TERMS_SUFFIX")}
          </FieldDescription>
        </div>
      </div>
    </div>
  )
}
