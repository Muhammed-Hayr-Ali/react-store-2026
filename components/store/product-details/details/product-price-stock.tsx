"use client"

/**
 * @file components/store/product-details/details/product-price-stock.tsx
 * @description Apple-inspired minimalist price, inventory status, and SKU display with full localization.
 */

import * as React from "react"
import { useTranslations } from "next-intl"
import { ProductVariantDetail } from "@/lib/actions/store/product-details/details/queries/get-product-details"
import { useCurrency } from "@/lib/context/currency-context"

interface ProductPriceStockProps {
  variant: ProductVariantDetail
}

export function ProductPriceStock({ variant }: ProductPriceStockProps) {
  const t = useTranslations("ProductDetails")
  const { formatRawPrice, currentCurrency } = useCurrency()
  
  const isOutOfStock = variant.track_inventory && variant.stock_quantity <= 0

  return (
    <div className="space-y-3 py-1">
      {/* السعر الرئيسي بنمط أبل البارز والهادئ */}
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-semibold tracking-tight text-foreground tabular-nums sm:text-4xl">
          {formatRawPrice(variant.price)}
        </span>
        <span className="text-sm font-medium text-muted-foreground">
          {currentCurrency.symbol}
        </span>

        {/* السعر القديم قبل الخصم إن وجد */}
        {variant.compare_at_price &&
          variant.compare_at_price > variant.price && (
            <span className="ms-3 text-sm text-muted-foreground line-through tabular-nums">
              {formatRawPrice(variant.compare_at_price)} {currentCurrency.symbol}
            </span>
          )}
      </div>

      {/* الحالة والـ SKU بتصميم نظيف ومترجم بالكامل */}
      <div className="flex flex-wrap items-center gap-4 text-xs">
        {isOutOfStock ? (
          <span className="font-medium text-destructive">
            {t("OUT_OF_STOCK", { default: "Out of stock" })}
          </span>
        ) : (
          <span className="font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {t("IN_STOCK", { default: "In stock" })}
            {variant.track_inventory && (
              <span className="text-muted-foreground font-normal">
                ({t("AVAILABLE_COUNT", { count: variant.stock_quantity, default: `${variant.stock_quantity} available` })})
              </span>
            )}
          </span>
        )}

        {variant.sku && (
          <span className="text-muted-foreground/80">
            {t("SKU_LABEL", { default: "SKU" })}: <span className="font-mono text-foreground">{variant.sku}</span>
          </span>
        )}
      </div>
    </div>
  )
}