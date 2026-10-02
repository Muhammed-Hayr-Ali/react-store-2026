import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeftIcon, ZapIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { FlashSaleForm } from "@/components/dashboard/flash-sales/flash-sale-form"
import { getAvailableProducts } from "@/lib/actions/flash-sales/queries/get-available-products"
import { getFlashSaleForEdit } from "@/lib/actions/flash-sales/queries/get-flash-sale-for-edit"
import { createMetadata } from "@/lib/config/metadata_generator"
import { appConfig } from "@/lib/config/app_config"

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
  const { locale, id } = await params

  const [saleResult, availableProducts] = await Promise.all([
    getFlashSaleForEdit(id),
    getAvailableProducts(),
  ])

  if (!saleResult) {
    notFound()
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border/40 pb-4">
        <Button asChild variant="ghost" size="icon" className="size-8">
          <Link href={`/${locale}/dashboard/flash-sales`}>
            <ArrowLeftIcon className="size-4" />
          </Link>
        </Button>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-destructive-foreground flex size-6 items-center justify-center rounded-md bg-destructive shadow-xs">
              <ZapIcon className="size-3.5 fill-current" />
            </span>
            <h1 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
              Edit Flash Sale
            </h1>
          </div>
          <p className="text-xs text-muted-foreground">
            Update campaign duration, settings, and discount rules.
          </p>
        </div>
      </div>

      {/* Form */}
      <FlashSaleForm
        saleId={saleResult.saleId}
        initialData={saleResult.initialData}
        availableProducts={availableProducts}
        onSuccessRedirect={`/${locale}/dashboard/flash-sales`}
      />
    </div>
  )
}
