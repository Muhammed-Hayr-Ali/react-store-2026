"use client"

import * as React from "react"
import { LayoutGridIcon, RowsIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FlashSaleProductItem } from "@/lib/actions/flash-sales/types"
import type { CurrencyCode } from "@/lib/actions/currency/types"
import { FlashProductCard } from "./flash-product-card"
import { cn } from "@/lib/utils"

interface FlashSaleGridProps {
  products: FlashSaleProductItem[]
  currency: CurrencyCode
  exchangeRate: number
  initialViewMode?: "grid" | "list"
}

export function FlashSaleGrid({
  products,
  currency,
  exchangeRate,
  initialViewMode = "grid",
}: FlashSaleGridProps) {
  const [viewMode, setViewMode] = React.useState<"grid" | "list">(
    initialViewMode
  )

  const toggleViewMode = (mode: "grid" | "list") => {
    setViewMode(mode)
    document.cookie = `product_view_mode=${mode}; max-age=${60 * 60 * 24 * 365}; path=/`
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-border/40 pb-2">
        <span className="text-xs font-medium text-muted-foreground">
          {products.length} {products.length === 1 ? "Product" : "Products"}
        </span>

        {/* أزرار التبديل بين Grid و List */}
        <div className="flex items-center gap-1 rounded-lg border border-border/40 bg-muted/20 p-0.5">
          <Button
            type="button"
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => toggleViewMode("grid")}
            className="size-7 rounded-md p-1"
            title="عرض شبكي"
          >
            <LayoutGridIcon className="size-3.5" />
          </Button>

          <Button
            type="button"
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => toggleViewMode("list")}
            className="size-7 rounded-md p-1"
            title="عرض قائمة"
          >
            <RowsIcon className="size-3.5" />
          </Button>
        </div>
      </div>

      <div
        className={cn(
          viewMode === "grid"
            ? "grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5"
            : "flex flex-col gap-2 sm:gap-2.5"
        )}
      >
        {products.map((product) => (
          <FlashProductCard
            key={product.id}
            product={product}
            currency={currency}
            exchangeRate={exchangeRate}
            viewMode={viewMode}
          />
        ))}
      </div>
    </div>
  )
}
