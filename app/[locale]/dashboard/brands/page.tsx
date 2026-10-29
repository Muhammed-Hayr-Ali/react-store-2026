import { getTranslations } from "next-intl/server"
import { TagsIcon } from "lucide-react"
import { BrandsManagement } from "@/components/dashboard/brands/brands-management"
import { getBrandsPageData } from "@/lib/actions/brands"
import { getBrandsSummary } from "@/lib/actions/brands"
import { getActionErrorKey } from "@/lib/actions/error-keys"
import { appConfig } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"
import { hasPermission, PERMISSIONS } from "@/lib/actions/role"
import { notFound } from "next/navigation"

interface PageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "BrandsManagement" })
  return createMetadata({
    siteName: appConfig.name,
    title: t("META_TITLE"),
    description: t("META_DESCRIPTION"),
  })
}

export default async function Page({ params }: PageProps) {
  const canView = await hasPermission(PERMISSIONS.VIEW_BRANDS_MANAGEMENT)
  if (!canView) {
    notFound()
  }

  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "BrandsManagement" })
  const errors = await getTranslations({ locale, namespace: "ActionErrors" })

  const [pageDataResult, summaryResult] = await Promise.all([
    getBrandsPageData(),
    getBrandsSummary(),
  ])

  if (!pageDataResult.success)
    throw new Error(
      errors(getActionErrorKey(pageDataResult.error ?? "UNEXPECTED_ERROR"))
    )

  if (!summaryResult.success)
    throw new Error(
      errors(getActionErrorKey(summaryResult.error ?? "UNEXPECTED_ERROR"))
    )

  const { brands, brandImages, isMobile } = pageDataResult.data
  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-2 py-4 md:px-4 md:py-6">
      <header className="flex items-center gap-2 border-b border-border/40 pb-4">
        <span className="flex size-7 items-center justify-center rounded-lg bg-secondary">
          <TagsIcon className="size-4" />
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
      <BrandsManagement
        brands={brands}
        summary={summaryResult.data}
        brandImages={brandImages}
        initialIsMobile={isMobile}
      />
    </main>
  )
}
