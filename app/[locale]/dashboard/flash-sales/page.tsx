import Link from "next/link"
import { PlusIcon, ZapIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getAllFlashSales } from "@/lib/actions/flash-sales/queries/get-all-flash-sales"
import { FlashSalesTable } from "@/components/dashboard/flash-sales/flash-sales-table"
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
    title: "Flash Sales Campaigns",
    description: "Manage limited-time flash sales and promotions.",
  })
}

export default async function FlashSalesPage({ params }: PageProps) {
  const { locale } = await params
  const sales = await getAllFlashSales()

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-border/40 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-destructive-foreground flex size-7 items-center justify-center rounded-lg bg-destructive shadow-xs">
              <ZapIcon className="size-4 fill-current" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Flash Sales
            </h1>
          </div>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Create, schedule, and manage limited-time flash sale campaigns.
          </p>
        </div>

        <Button
          asChild
          className="text-destructive-foreground gap-1.5 bg-destructive text-xs hover:bg-destructive/90"
        >
          <Link href={`/${locale}/dashboard/flash-sales/create`}>
            <PlusIcon className="size-3.5" />
            Create Flash Sale
          </Link>
        </Button>
      </div>

      {/* Campaigns Table */}
      <FlashSalesTable sales={sales} />
    </div>
  )
}
