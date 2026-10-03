import Link from "next/link"
import { headers } from "next/headers"
import { PackageIcon, PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getAdminProductsList } from "@/lib/actions/products/queries/get-admin-products"
import { DataTable } from "@/components/dashboard/products/all_products/data-table"
import { AdminProductSummary } from "@/lib/actions/products/types"
import { appConfig } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"
import { appRoutes } from "@/lib/config/app-routes"

export const dynamic = "force-dynamic"

export async function generateMetadata() {
  return createMetadata({
    siteName: appConfig.name,
    title: "Products Management",
    description:
      "Manage store inventory, monitor stock levels, view variants, and control product pricing.",
  })
}

export default async function Page() {
  const headersList = await headers()
  const userAgent = headersList.get("user-agent") || ""
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      userAgent
    )

  const result = await getAdminProductsList()
  const products: AdminProductSummary[] =
    result.success && result.data ? result.data : []

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-2 py-4 md:px-4 md:py-6">
      {/* Header (مطابق تماماً لصفحة العروض) */}
      <div className="flex flex-col gap-3 border-b border-border/40 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-secondary shadow-xs">
              <PackageIcon className="size-4 fill-current text-foreground" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Products
            </h1>
          </div>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Manage your product inventory, monitor stock levels, and configure
            pricing.
          </p>
        </div>

        <Button
          asChild
          variant="secondary"
          className="flex items-center gap-2 sm:ml-auto"
        >
          <Link href={appRoutes.dashboard.products.create}>
            <PlusIcon className="size-3.5" />
            Create Product
          </Link>
        </Button>
      </div>

      {/* Products Data Table */}
      <DataTable data={products} initialIsMobile={isMobile} />
    </div>
  )
}
