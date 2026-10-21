"use client"

/**
 * @file components/store/product-details/details/product-price-stock.tsx
 * @description Displays the selected variant price, compare-at price, inventory status, and SKU.
 */

import * as React from "react"
import { useTranslations } from "next-intl"
import { Badge } from "@/components/ui/badge"
import { ProductVariantDetail } from "@/lib/actions/store/product-details/details/queries/get-product-details"

interface ProductPriceStockProps {
  variant: ProductVariantDetail
}

export function ProductPriceStock({ variant }: ProductPriceStockProps) {
  const t = useTranslations("ProductDetails")

  // التحقق مما إذا كان المنتج قد نفذ من المخزون
  const isOutOfStock = variant.track_inventory && variant.stock_quantity <= 0

  return (
    <div className="flex flex-col gap-3 py-2">
      {/* قسم السعر */}
      <div className="flex items-center gap-3">
        <span className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          {variant.price / 100} USD
          <span className="text-sm font-normal text-muted-foreground">$</span>
        </span>

        {/* السعر القديم (قبل الخصم) إن وجد */}
        {variant.compare_at_price &&
          variant.compare_at_price > variant.price && (
            <span className="text-sm text-muted-foreground line-through sm:text-base">
              {variant.compare_at_price / 100} USD
            </span>
          )}
      </div>

      {/* قسم حالة المخزون و الـ SKU */}
      <div className="flex flex-wrap items-center gap-3">
        {isOutOfStock ? (
          <Badge variant="destructive" className="text-xs font-medium">
            {t("OUT_OF_STOCK", { default: "Out of stock" })}
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="border-emerald-500/30 bg-emerald-500/10 text-xs font-medium text-emerald-600"
          >
            {t("IN_STOCK", { default: "In stock" })}{" "}
            {variant.track_inventory && `(${variant.stock_quantity} available)`}
          </Badge>
        )}

        {variant.sku && (
          <span className="text-xs text-muted-foreground">
            SKU:{" "}
            <span className="font-mono font-medium text-foreground">
              {variant.sku}
            </span>
          </span>
        )}
      </div>
    </div>
  )
}
