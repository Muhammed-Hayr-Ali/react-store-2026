import Link from "next/link"
import { ArrowLeftIcon, ZapIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
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
    <div className="mx-auto w-full max-w-4xl space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header and Back Link */}
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
              Create Flash Sale
            </h1>
          </div>
          <p className="text-xs text-muted-foreground">
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
