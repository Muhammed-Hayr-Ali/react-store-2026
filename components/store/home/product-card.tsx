"use client"

import * as React from "react"
import Link from "next/link"
import { useLocale } from "next-intl"
import { ImageIcon, ShoppingBagIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  LatestProductItem,
  CategoryProductItem,
  BrandProductItem,
} from "@/lib/actions/products/types"
import { formatPrice as formatCurrencyPrice } from "@/lib/actions/currency/utils"
import type { CurrencyCode } from "@/lib/actions/currency/types"
import { getSiteAssetUrl } from "@/lib/database/supabase/storage"
import { cn } from "@/lib/utils"

interface ProductCardProps {
  product: LatestProductItem | CategoryProductItem | BrandProductItem
  currency: CurrencyCode
  exchangeRate: number
  viewMode?: "grid" | "list"
}

export function ProductCard({
  product,
  currency,
  exchangeRate,
  viewMode = "grid",
}: ProductCardProps) {
  const locale = useLocale()
  // حالة تتبع فشل تحميل الصورة
  const [imageError, setImageError] = React.useState(false)

  const formattedPrice = formatCurrencyPrice(
    product.min_price,
    currency,
    exchangeRate
  )

  const imageUrl = product.primary_image_url
    ? getSiteAssetUrl(product.primary_image_url)
    : null

  const isList = viewMode === "list"

  return (
    <div
      className={cn(
        "group relative flex w-full overflow-hidden rounded-lg border border-border/50 bg-card transition-all duration-300 hover:shadow-xs",
        isList ? "flex-row items-center gap-3 p-2 sm:gap-4" : "flex-col"
      )}
    >
      {/* رابط صورة المنتج */}
      <Link
        href={`/${locale}/product/${product.slug}`}
        className={cn(
          "relative shrink-0 overflow-hidden bg-muted/30",
          isList
            ? "aspect-square size-20 rounded-md sm:size-24"
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
          <div className="flex size-full flex-col items-center justify-center gap-1 bg-muted/40 text-muted-foreground/60 transition-colors group-hover:bg-muted/60">
            <ImageIcon
              className={cn("stroke-[1.5]", isList ? "size-6" : "size-8")}
            />
          </div>
        )}

        {product.brand_name && !isList && (
          <span className="absolute start-1.5 top-1.5 z-10 rounded bg-background/85 px-1.5 py-0.5 text-[9px] font-medium text-foreground backdrop-blur-xs">
            {product.brand_name}
          </span>
        )}
      </Link>

      {/* تفاصيل المنتج والسعر */}
      <div
        className={cn(
          "flex flex-1 justify-between",
          isList ? "flex-row items-center gap-2" : "flex-col p-2 sm:p-2.5"
        )}
      >
        <div className="min-w-0 flex-1 space-y-0.5">
          {product.category_name && (
            <span className="block truncate text-[10px] text-muted-foreground">
              {product.category_name}
            </span>
          )}

          <Link
            href={`/${locale}/product/${product.slug}`}
            className="line-clamp-1 block text-xs font-semibold text-foreground hover:underline sm:text-sm"
          >
            {product.name}
          </Link>
        </div>

        <div
          className={cn(
            "flex items-center justify-between gap-1.5",
            isList
              ? "shrink-0 gap-3 border-none p-0"
              : "mt-1.5 border-t border-border/30 pt-1.5"
          )}
        >
          <span className="text-xs font-bold text-foreground tabular-nums sm:text-sm">
            {formattedPrice}
          </span>

          <Button
            asChild
            size="icon"
            variant="secondary"
            className="size-6.5 rounded-full shadow-none sm:size-7"
          >
            <Link
              href={`/${locale}/product/${product.slug}`}
              aria-label={product.name}
            >
              <ShoppingBagIcon className="size-3 sm:size-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
