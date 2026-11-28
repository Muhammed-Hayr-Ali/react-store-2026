"use client"

/**
 * @file components/store/product-details/details/product-price-stock.tsx
 * @description Apple-inspired minimalist price, inventory status, and SKU display with full localization.
 */

import { useTranslations } from "next-intl"
import type { ProductVariantDetail } from "@/lib/actions/store/product-details/details/queries/get-product-details"
import { useCurrency } from "@/lib/context/currency-context"
import { cn } from "@/lib/utils"
import { getDiscountPercentage, isVariantOutOfStock } from "./variant-utils"

interface ProductPriceStockProps {
  variant: ProductVariantDetail
}

export function ProductPriceStock({ variant }: ProductPriceStockProps) {
  const t = useTranslations("ProductDetails")
  const { formatRawPrice, currentCurrency } = useCurrency()

  const isOutOfStock = isVariantOutOfStock(variant)
  const isLowStock =
    !isOutOfStock &&
    variant.track_inventory &&
    variant.stock_quantity <= variant.low_stock_threshold
  const discount = getDiscountPercentage(variant)

  const status = isOutOfStock
    ? {
        label: t("OUT_OF_STOCK"),
        badge: "bg-destructive/10 text-destructive",
        dot: "bg-destructive",
      }
    : isLowStock
      ? {
          label: t("LOW_STOCK"),
          badge: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
          dot: "bg-amber-500",
        }
      : {
          label: t("IN_STOCK"),
          badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
          dot: "bg-emerald-500",
        }

  return (
    <div className="space-y-4 border-b border-border/60 pb-6">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-semibold tracking-tight text-foreground tabular-nums sm:text-4xl">
            {formatRawPrice(variant.price)}
          </span>
          <span className="text-sm font-medium text-muted-foreground">
            {currentCurrency.symbol}
          </span>
        </div>

        {discount !== null && variant.compare_at_price !== null && (
          <>
            <del className="text-base text-muted-foreground/70 tabular-nums">
              {formatRawPrice(variant.compare_at_price)}{" "}
              {currentCurrency.symbol}
            </del>
            <span className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-semibold text-destructive">
              {discount}% {t("OFF")}
            </span>
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium",
              status.badge
            )}
          >
            <span className={cn("size-1.5 rounded-full", status.dot)} />
            {status.label}
          </span>
          {!isOutOfStock && variant.track_inventory && (
            <span className="text-muted-foreground">
              {t("AVAILABLE_COUNT", { count: variant.stock_quantity })}
            </span>
          )}
        </div>

        <span className="text-muted-foreground/80">
          {t("SKU_LABEL")}:{" "}
          <bdi className="font-mono text-foreground">{variant.sku}</bdi>
        </span>
      </div>
    </div>
  )
}
