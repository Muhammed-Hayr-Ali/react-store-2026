import { ZapIcon } from "lucide-react"

import { FlashSaleForm } from "@/components/dashboard/flash-sales/flash-sale-form"
import { getAvailableProducts } from "@/lib/actions/flash-sales/queries/get-available-products"
import { createMetadata } from "@/lib/config/metadata_generator"
import { appConfig } from "@/lib/config/app_config"

interface PageProps {
  params: Promise<{
    locale: string
  }>
}

export async function generateMetadata() {
  return createMetadata({
    siteName: appConfig.name,
    title: "Create Flash Sale",
    description: "Launch a new flash sale campaign.",
  })
}

export default async function CreateFlashSalePage({ params }: PageProps) {
  const { locale } = await params
  const availableProducts = await getAvailableProducts()

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-2 py-4 md:px-4 md:py-6">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-secondary shadow-xs">
              <ZapIcon className="size-4 text-foreground" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Create Flash Sale
            </h1>
          </div>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Set duration, pick products, and define custom discounts.
          </p>
        </div>
      </div>
      {/* Form */}
      <FlashSaleForm
        availableProducts={availableProducts}
        onSuccessRedirect={`/${locale}/dashboard/flash-sales`}
      />
    </div>
  )
}
