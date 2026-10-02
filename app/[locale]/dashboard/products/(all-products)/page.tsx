import { getAdminProductsList } from "@/lib/actions/products/queries/get-admin-products"
import { DataTable } from "@/components/dashboard/products/all_products/data-table"
import { AdminProductSummary } from "@/lib/actions/products/types"
import { appConfig } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"

export const dynamic = "force-dynamic"

export async function generateMetadata() {
  return createMetadata({
    siteName: appConfig.name,
    title: "All Products - Dashboard",
    description:
      "Manage store inventory, monitor stock levels, view variants, and control product pricing.",
  })
}

export default async function Page() {
  const result = await getAdminProductsList()

  const products: AdminProductSummary[] =
    result.success && result.data ? result.data : []

  return (
    <div className="flex w-full flex-1 flex-col">
      <DataTable data={products} />
    </div>
  )
}
