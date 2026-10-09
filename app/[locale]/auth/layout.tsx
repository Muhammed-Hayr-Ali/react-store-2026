/**
 * @file app/[locale]/(auth)/layout.tsx
 * @description Master authentication layout providing unified card boundaries,
 * logical RTL navigation, and accessible legal compliance footer.
 */

import * as React from "react"
import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
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
  await params
  const t = await getTranslations("AuthLayout")

  return (
    <main className="flex min-h-svh w-full flex-col items-center justify-between p-4 sm:p-6 md:p-8">
      {/* Mobile Top Navigation Bar */}
      <div className="flex w-full items-center justify-start md:hidden">
        <Button
          variant="ghost"
          size="icon"
          className="size-8 cursor-pointer text-muted-foreground hover:text-foreground"
          asChild
        >
          <Link href={appRoutes.home}>
            <ArrowLeft className="size-4 rtl:rotate-180" />
            <span className="sr-only">{t("BACK_TO_HOME_SR")}</span>
          </Link>
        </Button>
      </div>

      {/* Main Authentication Card Container */}
      <div className="flex w-full flex-1 flex-col items-center justify-center py-6 sm:py-10">
        <div className="w-full max-w-sm sm:max-w-md">
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm sm:p-8">
            {children}
          </div>
        </div>
      </div>

      {/* Legal & Compliance Footer */}
      <footer className="w-full max-w-sm text-center sm:max-w-md">
        <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
          {t("TERMS_PREFIX")}{" "}
          <Link
            href={appRoutes.terms ?? "#"}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {t("TERMS_OF_SERVICE")}
          </Link>{" "}
          {t("TERMS_AND")}{" "}
          <Link
            href={appRoutes.privacy ?? "#"}
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