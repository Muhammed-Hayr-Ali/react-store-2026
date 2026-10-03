import { notFound } from "next/navigation"
import { cookies } from "next/headers"
import { getLocale } from "next-intl/server"
import { ZapIcon } from "lucide-react"

import { getFlashSaleBySlug } from "@/lib/actions/flash-sales/queries/get-flash-sale-by-slug"
import { getSelectedCurrency } from "@/lib/actions/currency/queries/get-selected-currency"
import { getExchangeRates } from "@/lib/actions/currency/queries/get-rates"
import { CountdownTimer } from "@/components/store/home/countdown-timer"
import { FlashSaleGrid } from "@/components/store/flash-sale/flash-sale-grid"
import { createMetadata } from "@/lib/config/metadata_generator"
import { appConfig } from "@/lib/config/app_config"

interface PageProps {
  params: Promise<{
    locale: string
    slug: string
  }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const sale = await getFlashSaleBySlug(slug)

  if (!sale) return {}

  return createMetadata({
    siteName: appConfig.name,
    title: sale.title,
    description: sale.description || "Limited-time deals and flash discounts.",
  })
}

export default async function FlashSalePage({ params }: PageProps) {
  const { slug } = await params
  const locale = await getLocale()
  const isRtl = locale === "ar"

  const [sale, selectedCurrency, exchangeRates] = await Promise.all([
    getFlashSaleBySlug(slug),
    getSelectedCurrency(),
    getExchangeRates(),
  ])

  if (!sale || sale.products.length === 0) {
    notFound()
  }

  const currentRate =
    exchangeRates.find((r) => r.currency_code === selectedCurrency)
      ?.rate_from_usd ?? 1

  const cookieStore = await cookies()
  const viewModeCookie = cookieStore.get("product_view_mode")?.value
  const initialViewMode = (viewModeCookie === "list" ? "list" : "grid") as
    "grid" | "list"

  const title = isRtl && sale.title_ar ? sale.title_ar : sale.title

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      {/* ترويسة الحملة مع العداد التنازلي */}
      <div className="mb-6 rounded-2xl border border-destructive/20 bg-linear-to-b from-destructive/10 via-destructive/5 to-transparent p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-destructive-foreground flex size-7 items-center justify-center rounded-lg bg-destructive shadow-xs sm:size-8">
                <ZapIcon className="size-4 fill-current" />
              </span>
              <h1 className="text-lg font-bold tracking-tight text-foreground sm:text-2xl">
                {title}
              </h1>
            </div>
            {sale.description && (
              <p className="text-xs text-muted-foreground sm:text-sm">
                {sale.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-background/80 p-2 shadow-xs backdrop-blur-xs">
            <span className="text-[11px] font-medium text-muted-foreground">
              {isRtl ? "ينتهي خلال:" : "Ends in:"}
            </span>
            <CountdownTimer
              targetDate={sale.ends_at}
              labels={{
                days: isRtl ? "ي" : "d",
                hours: isRtl ? "س" : "h",
                minutes: isRtl ? "د" : "m",
                seconds: isRtl ? "ث" : "s",
              }}
            />
          </div>
        </div>
      </div>

      {/* عرض المنتجات التابعة للعرض */}
      <FlashSaleGrid
        products={sale.products}
        currency={selectedCurrency}
        exchangeRate={currentRate}
        initialViewMode={initialViewMode}
      />
    </div>
  )
}
