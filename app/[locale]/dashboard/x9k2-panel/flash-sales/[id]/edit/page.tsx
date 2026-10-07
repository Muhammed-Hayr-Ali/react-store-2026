import { notFound } from "next/navigation"
import { ZapIcon } from "lucide-react"

import { FlashSaleForm } from "@/components/dashboard/flash-sales/flash-sale-form"
import { getAvailableProducts } from "@/lib/actions/flash-sales/queries/get-available-products"
import { getFlashSaleForEdit } from "@/lib/actions/flash-sales/queries/get-flash-sale-for-edit"
import { createMetadata } from "@/lib/config/metadata_generator"
import { appConfig } from "@/lib/config/app_config"
import { hasPermission, PERMISSIONS } from "@/lib/actions/role"


export const dynamic = "force-dynamic"


interface PageProps {
  params: Promise<{
    locale: string
    id: string
  }>
}

export async function generateMetadata() {
  return createMetadata({
    siteName: appConfig.name,
    title: "Edit Flash Sale",
    description: "Modify flash sale campaign details and product discounts.",
  })
}

export default async function EditFlashSalePage({ params }: PageProps) {
  const canView = await hasPermission(PERMISSIONS.UPDATE_FLASH_SALE)
  if (!canView) {
    notFound()
  }

  const { locale, id } = await params

  const [saleResult, availableProducts] = await Promise.all([
    getFlashSaleForEdit(id),
    getAvailableProducts(),
  ])

  if (!saleResult) {
    notFound()
  }

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
              Edit Flash Sale
            </h1>
          </div>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Update campaign duration, settings, and discount rules.
          </p>
        </div>
      </div>

      <FlashSaleForm
        saleId={saleResult.saleId}
        initialData={saleResult.initialData}
        availableProducts={availableProducts}
        onSuccessRedirect={`/${locale}/dashboard/flash-sales`}
      />
    </div>
  )
}
