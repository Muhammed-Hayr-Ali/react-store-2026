import { getTranslations } from "next-intl/server"
import { MessageSquareIcon } from "lucide-react"

import { ReviewsTable } from "@/components/dashboard/reviews/reviews-table"
import { ReviewsSummary } from "@/components/dashboard/reviews/reviews-summary"
import { getReviewsPageData } from "@/lib/actions/reviews/queries/get-reviews-page-data"
// نستخدم الـ Page Data الذي يجمع كل شيء، لكن لو احتجنا الملخص منفصلاً سنستخدمه من الداخل
import { getActionErrorKey } from "@/lib/actions/error-keys"
import { appConfig } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"
import { notFound } from "next/navigation"
import { hasPermission, PERMISSIONS } from "@/lib/actions/role"

interface PageProps {
  params: Promise<{
    locale: string
  }>
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params
  const t = await getTranslations({
    locale,
    namespace: "ReviewsManagement",
  })
  return createMetadata({
    siteName: appConfig.name,
    title: t("META_TITLE"),
    description: t("META_DESCRIPTION"),
  })
}

export default async function Page({ params }: PageProps) {
  const canView = await hasPermission(PERMISSIONS.VIEW_REVIEWS_DASHBOARD)
  if (!canView) {
    notFound()
  }

  const { locale } = await params
  const t = await getTranslations({
    locale,
    namespace: "ReviewsManagement",
  })
  const tErrors = await getTranslations({
    locale,
    namespace: "ActionErrors",
  })

  // Fetch pre-processed page data and business logic
  // نحن جلبنا كل شيء بداخل دالة getReviewsPageData كما بنيناها سابقاً
  const pageDataResult = await getReviewsPageData()

  if (!pageDataResult.success) {
    throw new Error(
      tErrors(getActionErrorKey(pageDataResult.error ?? "UNEXPECTED_ERROR"))
    )
  }

  const { reviews, summary, isMobile } = pageDataResult.data

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-2 py-4 md:px-4 md:py-6">
      <div className="flex flex-col gap-3 border-b border-border/40 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-secondary shadow-xs">
              <MessageSquareIcon className="size-4 text-foreground" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {t("PAGE_TITLE")}
            </h1>
          </div>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            {t("PAGE_DESCRIPTION")}
          </p>
        </div>
      </div>

      <ReviewsSummary
        totalCount={summary.total}
        approvedCount={summary.approved}
        pendingCount={summary.pending}
        totalLabel={t("TOTAL_COUNT")}
        approvedLabel={t("APPROVED_COUNT")}
        pendingLabel={t("PENDING_COUNT")}
      />

      <ReviewsTable initialReviews={reviews} initialIsMobile={isMobile} />
    </div>
  )
}
