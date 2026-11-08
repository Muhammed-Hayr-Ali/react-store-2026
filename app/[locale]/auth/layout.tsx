/**
 * @file app/[locale]/(auth)/layout.tsx
 * @description Master authentication layout providing unified card boundaries,
 * localized RTL navigation, and accessible legal compliance footer pinned at the bottom
 * with a seamless inverted gradient background.
 */

import * as React from "react"
import Link from "next/link"
import { getTranslations } from "next-intl/server"

import { APP_ROUTES } from "@/lib/config/app-routes"
import { FieldDescription } from "@/components/ui/field"
import { AppLogo } from "@/components/ui/app-logo"

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
        <Link
          href={APP_ROUTES.HOME}
          className="flex items-center gap-2 self-center font-medium"
        >
          <div className="flex size-10 items-center justify-center rounded-[50%] bg-primary text-primary-foreground corner-squircle">
            <AppLogo className="size-6" />
          </div>
        </Link>

        <div className="flex flex-col gap-6">
          {children}
          <FieldDescription className="px-6 text-center text-[10px] leading-relaxed text-muted-foreground/80">
            {t("TERMS_PREFIX")}{" "}
            <Link
              href={`/${locale}${APP_ROUTES.TERMS ?? "#"}`}
              className="text-primary underline-offset-4 hover:underline"
            >
              {t("TERMS_OF_SERVICE")}
            </Link>{" "}
            {t("TERMS_AND")}{" "}
            <Link
              href={`/${locale}${APP_ROUTES.PRIVACY ?? "#"}`}
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
