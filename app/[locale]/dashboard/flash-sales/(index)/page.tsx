import { ZapIcon } from "lucide-react"

import { getAllFlashSales } from "@/lib/actions/flash-sales/queries/get-all-flash-sales"
import { FlashSalesTable } from "@/components/dashboard/flash-sales/flash-sales-table"
import { createMetadata } from "@/lib/config/metadata_generator"
import { appConfig } from "@/lib/config/app_config"



export async function generateMetadata() {
  return createMetadata({
    siteName: appConfig.name,
    title: "Flash Sales Campaigns",
    description: "Manage limited-time flash sales and promotions.",
  })
}

export default async function FlashSalesPage() {
  const sales = await getAllFlashSales()

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-2 py-4 md:px-4 md:py-6">
      <div className="flex flex-col gap-3 border-b border-border/40 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-secondary shadow-xs">
              <ZapIcon className="size-4 fill-current text-foreground" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Flash Sales
            </h1>
          </div>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Create, schedule, and manage limited-time flash sale campaigns.
          </p>
        </div>
      </div>

      <FlashSalesTable sales={sales} />
    </div>
  )
}
