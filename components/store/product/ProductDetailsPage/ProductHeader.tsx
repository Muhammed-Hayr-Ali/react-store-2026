"use client"

import * as React from "react"
import { AlertCircleIcon } from "lucide-react"
import { formatPrice, ProductVariantItem } from "./utils"

interface ProductHeaderProps {
  productName: string
  categoryName?: string
  brandName?: string
  selectedVariant: ProductVariantItem | null
  isOutOfStock: boolean
  isLowStock: boolean
}

export function ProductHeader({
  productName,
  categoryName,
  brandName,
  selectedVariant,
  isOutOfStock,
  isLowStock,
}: ProductHeaderProps) {
  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
        {categoryName && (
          <span className="rounded-md bg-muted px-2 py-0.5 text-foreground">
            {categoryName}
          </span>
        )}
        {brandName && (
          <>
            <span>•</span>
            <span>{brandName}</span>
          </>
        )}
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {productName}
      </h1>

      <div className="flex h-11 items-center justify-between">
        <div className="flex items-center gap-3">
          {isOutOfStock ? (
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircleIcon className="size-6 shrink-0" />
              <span className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                Out of Stock
              </span>
            </div>
          ) : (
            <>
              <span className="text-2xl font-extrabold tracking-tight text-foreground tabular-nums sm:text-3xl">
                ${formatPrice(selectedVariant?.price ?? 0)}
              </span>
              {selectedVariant?.compare_at_price &&
                selectedVariant.compare_at_price > selectedVariant.price && (
                  <span className="text-base text-muted-foreground tabular-nums line-through">
                    ${formatPrice(selectedVariant.compare_at_price)}
                  </span>
                )}
            </>
          )}
        </div>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
            isOutOfStock
              ? "bg-destructive/10 text-destructive"
              : isLowStock
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          }`}
        >
          <span
            className={`size-1.5 rounded-full ${
              isOutOfStock
                ? "bg-destructive"
                : isLowStock
                  ? "bg-amber-500"
                  : "bg-emerald-500"
            }`}
          />
          {isOutOfStock
            ? "Unavailable"
            : isLowStock
              ? `Only ${selectedVariant?.stock_quantity} left`
              : "In Stock"}
        </span>
      </div>
    </div>
  )
}
