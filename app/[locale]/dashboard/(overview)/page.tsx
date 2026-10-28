 import { getTranslations } from "next-intl/server"
 import { appConfig } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"
 
interface PageProps {
  params: Promise<{
    locale: string
  }>
}

// 1. تحديث دالة الميتا داتا لجلب الترجمات بناءً على اللغة الحالية
export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "DashboardPage" })

  return createMetadata({
    siteName: appConfig.name,
    title: t("META_TITLE"),
    description: t("META_DESCRIPTION"),
  })
}

export default async function UserOverviewPage({ params }: PageProps) {
  const { locale } = await params
  // 2. تهيئة المترجم ليعمل داخل المكون الخادم (Server Component)
  const t = await getTranslations({ locale, namespace: "DashboardPage" })
 
 

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-2 py-4 md:px-4 md:py-6">
      {/* User Overview */}
        <>
          <div className="border-b border-border/40 pb-3">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              {t("USER_OVERVIEW_TITLE")}
            </h1>
            <p className="text-xs text-muted-foreground">
              {t("USER_OVERVIEW_DESC")}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex aspect-video flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-xs">
              <span className="text-xs font-medium text-muted-foreground">
                {t("TOTAL_ORDERS")}
              </span>
              <span className="text-2xl font-bold text-foreground">--</span>
            </div>
            <div className="flex aspect-video flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-xs">
              <span className="text-xs font-medium text-muted-foreground">
                {t("ACTIVE_DELIVERIES")}
              </span>
              <span className="text-2xl font-bold text-foreground">--</span>
            </div>
            <div className="flex aspect-video flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-xs">
              <span className="text-xs font-medium text-muted-foreground">
                {t("SAVED_ADDRESSES")}
              </span>
              <span className="text-2xl font-bold text-foreground">--</span>
            </div>
          </div>

          <div className="flex min-h-100 flex-1 items-center justify-center rounded-xl border border-border bg-card p-6 text-xs text-muted-foreground shadow-xs">
            {t("RECENT_ACTIVITIES")}
          </div>
        </>

      {/* Admin Overview */}
        <>
          <div className="border-b border-border/40 pb-3">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              {t("ADMIN_OVERVIEW_TITLE")}
            </h1>
            <p className="text-xs text-muted-foreground">
              {t("ADMIN_OVERVIEW_DESC")}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex aspect-video flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-xs">
              <span className="text-xs font-medium text-muted-foreground">
                {t("TOTAL_REVENUE")}
              </span>
              <span className="text-2xl font-bold text-foreground">--</span>
            </div>
            <div className="flex aspect-video flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-xs">
              <span className="text-xs font-medium text-muted-foreground">
                {t("STORE_ORDERS")}
              </span>
              <span className="text-2xl font-bold text-foreground">--</span>
            </div>
            <div className="flex aspect-video flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-xs">
              <span className="text-xs font-medium text-muted-foreground">
                {t("ACTIVE_CUSTOMERS")}
              </span>
              <span className="text-2xl font-bold text-foreground">--</span>
            </div>
          </div>

          <div className="flex min-h-100 flex-1 items-center justify-center rounded-xl border border-border bg-card p-6 text-xs text-muted-foreground shadow-xs">
            {t("PLATFORM_ANALYTICS")}
          </div>
        </>
    </div>
  )
}
