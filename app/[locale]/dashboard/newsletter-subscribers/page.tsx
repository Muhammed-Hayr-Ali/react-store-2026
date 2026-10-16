import { headers } from "next/headers"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { MailIcon } from "lucide-react"

import { NewsletterSubscribersTable } from "@/components/dashboard/newsletter-subscribers/newsletter-subscribers-table"
import { getActionErrorKey } from "@/lib/actions/error-keys"
import { getNewsletterSubscribers } from "@/lib/actions/newsletter_subscribers/queries/get-newsletter-subscribers"
import { hasPermission, PERMISSIONS } from "@/lib/actions/role"
import { appConfig } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"

interface PageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params
  const t = await getTranslations({
    locale,
    namespace: "NewsletterSubscribersManagement",
  })
  return createMetadata({
    siteName: appConfig.name,
    title: t("META_TITLE"),
    description: t("META_DESCRIPTION"),
  })
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params
  const t = await getTranslations({
    locale,
    namespace: "NewsletterSubscribersManagement",
  })
  const tErrors = await getTranslations({
    locale,
    namespace: "ActionErrors",
  })

  if (!(await hasPermission(PERMISSIONS.VIEW_NEWSLETTER_SUBSCRIBERS))) {
    notFound()
  }

  const result = await getNewsletterSubscribers()
  if (!result.success) {
    throw new Error(tErrors(getActionErrorKey(result.error)))
  }

  const headersList = await headers()
  const userAgent = headersList.get("user-agent") || ""
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      userAgent
    )

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-2 py-4 md:px-4 md:py-6">
      <div className="flex flex-col gap-3 border-b border-border/40 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-secondary shadow-xs">
              <MailIcon className="size-4 text-foreground" />
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

      <NewsletterSubscribersTable
        initialSubscribers={result.data}
        locale={locale === "ar" ? "ar" : "en"}
        initialIsMobile={isMobile}
      />
    </div>
  )
}
