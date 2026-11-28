import { getTranslations } from "next-intl/server"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import { MegaphoneIcon } from "lucide-react"

import { PromoBannersTable } from "@/components/dashboard/promo-banners/promo-banners-table"
import { getActionErrorKey } from "@/lib/actions/error-keys"
import { getAdminPromoBannersList } from "@/lib/actions/promo-banners"
import { hasPermission, PERMISSIONS } from "@/lib/actions/role"
import { APP_CONFIG } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"

interface PageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params
  const t = await getTranslations({
    locale,
    namespace: "PromoBannersManagement",
  })

  return createMetadata({
    siteName: APP_CONFIG.NAME,
    title: t("META_TITLE"),
    description: t("META_DESCRIPTION"),
  })
}

export default async function Page({ params }: PageProps) {
  const canView = await hasPermission(
    PERMISSIONS.VIEW_PROMO_BANNERS_DASHBOARD
  )
  if (!canView) notFound()

  const { locale } = await params
  const t = await getTranslations({
    locale,
    namespace: "PromoBannersManagement",
  })
  const errorT = await getTranslations({ locale, namespace: "ActionErrors" })
  const result = await getAdminPromoBannersList()
  if (!result.success) {
    throw new Error(errorT(getActionErrorKey(result.error)))
  }

  const headersList = await headers()
  const userAgent = headersList.get("user-agent") || ""
  const initialIsMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      userAgent
    )

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-2 py-4 md:px-4 md:py-6">
      <header className="flex items-center gap-2 border-b border-border/40 pb-4">
        <span className="flex size-7 items-center justify-center rounded-lg bg-secondary">
          <MegaphoneIcon className="size-4" />
        </span>
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            {t("PAGE_TITLE")}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            {t("PAGE_DESCRIPTION")}
          </p>
        </div>
      </header>
      <PromoBannersTable
        initialBanners={result.data}
        initialIsMobile={initialIsMobile}
      />
    </main>
  )
}
