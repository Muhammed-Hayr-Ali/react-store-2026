import { getTranslations } from "next-intl/server"
import type { BrandRecord } from "@/lib/actions/brands/types"
import { BrandsSummary } from "./brands-summary"
import { BrandsTable } from "./brands-table"

interface BrandsManagementProps {
  brands: BrandRecord[]
  summary: { total: number; active: number; inactive: number }
  brandImages: string[]
  initialIsMobile: boolean
}

export async function BrandsManagement({
  brands,
  summary,
  brandImages,
  initialIsMobile,
}: BrandsManagementProps) {
  const t = await getTranslations("BrandsManagement")
  return (
    <div className="space-y-4">
      <BrandsSummary
        totalCount={summary.total}
        activeCount={summary.active}
        inactiveCount={summary.inactive}
        totalLabel={t("TOTAL_COUNT")}
        activeLabel={t("ACTIVE_COUNT")}
        inactiveLabel={t("INACTIVE_COUNT")}
      />
      <BrandsTable
        initialBrands={brands}
        brandImages={brandImages}
        initialIsMobile={initialIsMobile}
      />
    </div>
  )
}
