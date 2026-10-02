"use client"

import * as React from "react"
import Link from "next/link"
import { useLocale } from "next-intl"
import { FlameIcon, ImageIcon, ShoppingBagIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { FlashSaleProductItem } from "@/lib/actions/flash-sales/types"
import { formatPrice as formatCurrencyPrice } from "@/lib/actions/currency/utils"
import type { CurrencyCode } from "@/lib/actions/currency/types"
import { getSiteAssetUrl } from "@/lib/database/supabase/storage"
import { cn } from "@/lib/utils"

interface FlashProductCardProps {
  product: FlashSaleProductItem
  currency: CurrencyCode
  exchangeRate: number
  viewMode?: "grid" | "list"
}

export function FlashProductCard({
  product,
  currency,
  exchangeRate,
  viewMode = "grid",
}: FlashProductCardProps) {
  const locale = useLocale()
  const isRtl = locale === "ar"
  const [imageError, setImageError] = React.useState(false)

  const isList = viewMode === "list"

  const formattedFlashPrice = formatCurrencyPrice(
    product.flash_price,
    currency,
    exchangeRate
  )

  const hasDiscount = product.flash_price < product.original_price
  const formattedOriginalPrice = hasDiscount
    ? formatCurrencyPrice(product.original_price, currency, exchangeRate)
    : null

  const imageUrl = product.primary_image_url
    ? getSiteAssetUrl(product.primary_image_url)
    : null

  const soldPercentage =
    product.quantity_limit && product.quantity_limit > 0
      ? Math.min(
          100,
          Math.round((product.sold_count / product.quantity_limit) * 100)
        )
      : null

  return (
    <div
      className={cn(
        "group relative flex w-full overflow-hidden rounded-lg border border-destructive/20 bg-card transition-all duration-300 hover:border-destructive/40 hover:shadow-xs",
        isList ? "flex-row items-center gap-2.5 p-1.5 sm:gap-3" : "flex-col"
      )}
    >
      {/* رابط صورة المنتج */}
      <Link
        href={`/${locale}/product/${product.slug}`}
        className={cn(
          "relative shrink-0 overflow-hidden bg-muted/20",
          isList
            ? "aspect-square size-16 rounded-md sm:size-20"
            : "aspect-square w-full"
        )}
      >
        {imageUrl && !imageError ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            onError={() => setImageError(true)}
            className="size-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-0.5 bg-muted/30 text-muted-foreground/60">
            <ImageIcon
              className={cn("stroke-[1.5]", isList ? "size-4" : "size-6")}
            />
          </div>
        )}

        {/* شارة الخصم العائمة */}
        <div className="absolute inset-s-1 top-1 z-10 flex flex-col gap-0.5">
          {product.discount_percentage ? (
            <span className="text-destructive-foreground py-0.2 inline-flex items-center gap-0.5 rounded bg-destructive/90 px-1 text-[8px] text-white shadow-xs backdrop-blur-xs sm:text-[9px]">
              <FlameIcon className="size-2.5 fill-current" />
              {product.discount_percentage}%
            </span>
          ) : (
            <span className="py-0.2 inline-flex items-center rounded bg-primary/90 px-1 text-[8px] font-semibold text-primary-foreground shadow-xs backdrop-blur-xs">
              DEAL
            </span>
          )}
        </div>
      </Link>

      {/* تفاصيل المنتج والسعر */}
      <div
        className={cn(
          "flex flex-1 justify-between",
          isList ? "flex-row items-center gap-2" : "flex-col p-1.5 sm:p-2"
        )}
      >
        <div className="min-w-0 flex-1 space-y-0.5">
          {product.category_name && (
            <span className="block truncate text-[9px] font-medium text-muted-foreground">
              {product.category_name}
            </span>
          )}

          <Link
            href={`/${locale}/product/${product.slug}`}
            className="line-clamp-1 block text-[11px] font-medium text-foreground transition-colors hover:text-primary sm:text-xs"
          >
            {product.name}
          </Link>

          {/* شريط تقدم الكمية المباعة المدمج */}
          {soldPercentage !== null && (
            <div className="pt-0.5">
              <div className="flex justify-between text-[8px] font-medium text-muted-foreground">
                <span>{isRtl ? "مباع" : "Sold"}</span>
                <span>{soldPercentage}%</span>
              </div>
              <div className="mt-0.5 h-1 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-destructive transition-all duration-300"
                  style={{ width: `${soldPercentage}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* الأسعار وزر الإضافة */}
        <div
          className={cn(
            "flex items-center justify-between gap-1.5",
            isList
              ? "shrink-0 gap-2 border-none p-0"
              : "mt-1 border-t border-border/30 pt-1"
          )}
        >
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-destructive tabular-nums sm:text-xs">
              {formattedFlashPrice}
            </span>
            {formattedOriginalPrice && (
              <span className="text-[9px] text-muted-foreground tabular-nums line-through">
                {formattedOriginalPrice}
              </span>
            )}
          </div>

          <Button
            asChild
            size="icon"
            variant="secondary"
            className="text-destructive-foreground size-5.5 rounded-full shadow-none sm:size-6.5"
          >
            <Link
              href={`/${locale}/product/${product.slug}`}
              aria-label={product.name}
            >
              <ShoppingBagIcon className="size-2.5 sm:size-3" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
