"use client"

import * as React from "react"
import Link from "next/link"
import { useLocale } from "next-intl"
import { AlertCircleIcon, ZapIcon } from "lucide-react"
import { ProductVariantItem } from "./utils"
import { formatPrice as formatCurrencyPrice } from "@/lib/actions/currency/utils"
import type { CurrencyCode } from "@/lib/actions/currency/types"

interface ProductHeaderProps {
  productName: string
  categoryName?: string
  categorySlug?: string
  brandName?: string
  brandSlug?: string
  selectedVariant: ProductVariantItem | null
  isOutOfStock: boolean
  isLowStock: boolean
  currency: CurrencyCode
  exchangeRate: number
  isFlashSale?: boolean
  flashSalePercentage?: number | null
  flashSaleSlug?: string | null
  flashSaleTitle?: string | null
}

export function ProductHeader({
  productName,
  categoryName,
  categorySlug,
  brandName,
  brandSlug,
  selectedVariant,
  isOutOfStock,
  isLowStock,
  currency,
  exchangeRate,
  isFlashSale = false,
  flashSalePercentage,
  flashSaleSlug,
  flashSaleTitle,
}: ProductHeaderProps) {
  const locale = useLocale()

  const currentPrice = selectedVariant
    ? formatCurrencyPrice(selectedVariant.price, currency, exchangeRate)
    : formatCurrencyPrice(0, currency, exchangeRate)

  const comparePrice =
    selectedVariant?.compare_at_price &&
    selectedVariant.compare_at_price > selectedVariant.price
      ? formatCurrencyPrice(
          selectedVariant.compare_at_price,
          currency,
          exchangeRate
        )
      : null

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
        {isFlashSale &&
          (flashSaleSlug ? (
            <Link
              href={`/${locale}/deals/${flashSaleSlug}`}
              className="inline-flex items-center gap-1 rounded-md bg-destructive/15 px-2 py-0.5 text-xs font-bold text-destructive transition-colors hover:bg-destructive/25"
            >
              <ZapIcon className="size-3 fill-current" />
              <span>{flashSaleTitle || "Limited Flash Sale"}</span>
              <span className="ms-1 font-normal underline opacity-85">
                (View All)
              </span>
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-md bg-destructive/15 px-2 py-0.5 text-xs font-bold text-destructive">
              <ZapIcon className="size-3 fill-current" />
              {flashSaleTitle || "Limited Flash Sale"}
            </span>
          ))}

        {categoryName &&
          (categorySlug ? (
            <Link
              href={`/${locale}/category/${categorySlug}`}
              className="rounded-md bg-muted px-2 py-0.5 text-foreground transition-colors hover:bg-muted/80 hover:underline"
            >
              {categoryName}
            </Link>
          ) : (
            <span className="rounded-md bg-muted px-2 py-0.5 text-foreground">
              {categoryName}
            </span>
          ))}

        {brandName && (
          <>
            <span>•</span>
            {brandSlug ? (
              <Link
                href={`/${locale}/brand/${brandSlug}`}
                className="transition-colors hover:text-foreground hover:underline"
              >
                {brandName}
              </Link>
            ) : (
              <span>{brandName}</span>
            )}
          </>
        )}
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {productName}
      </h1>

      <div className="flex h-11 items-center justify-between">
        <div className="flex items-baseline gap-3">
          {isOutOfStock ? (
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircleIcon className="size-6 shrink-0" />
              <span className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                Out of Stock
              </span>
            </div>
          ) : (
            <>
              <span
                className={`text-2xl font-extrabold tracking-tight tabular-nums sm:text-3xl ${
                  isFlashSale
                    ? "font-black text-destructive"
                    : "text-foreground"
                }`}
              >
                {currentPrice}
              </span>

              {comparePrice && (
                <span className="text-base text-muted-foreground tabular-nums line-through decoration-destructive/50">
                  {comparePrice}
                </span>
              )}

              {flashSalePercentage ? (
                <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-bold text-destructive">
                  -{flashSalePercentage}%
                </span>
              ) : null}
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
