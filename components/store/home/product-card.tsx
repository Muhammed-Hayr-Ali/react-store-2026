"use client"

import * as React from "react"
import Link from "next/link"
import { useLocale } from "next-intl"
import { ShoppingBagIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { LatestProductItem } from "@/lib/actions/products/types"
import { formatPrice as formatCurrencyPrice } from "@/lib/actions/currency/utils"
import type { CurrencyCode } from "@/lib/actions/currency/types"
import { getSiteAssetUrl } from "@/lib/database/supabase/storage"

interface ProductCardProps {
  product: LatestProductItem
  currency: CurrencyCode
  exchangeRate: number
}

export function ProductCard({
  product,
  currency,
  exchangeRate,
}: ProductCardProps) {
  const locale = useLocale()

  const formattedPrice = formatCurrencyPrice(
    product.min_price,
    currency,
    exchangeRate
  )

  const imageUrl = product.primary_image_url
    ? getSiteAssetUrl(product.primary_image_url)
    : null

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-border/50 bg-card transition-all duration-300 hover:shadow-sm">
      {/* رابط صورة المنتج */}
      <Link
        href={`/${locale}/product/${product.slug}`}
        className="relative aspect-square w-full overflow-hidden bg-muted/30"
      >
        {imageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            className="size-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-[11px] text-muted-foreground">
            No image
          </div>
        )}

        {product.brand_name && (
          <span className="absolute start-1.5 top-1.5 z-10 rounded bg-background/85 px-1.5 py-0.5 text-[9px] font-medium text-foreground backdrop-blur-xs">
            {product.brand_name}
          </span>
        )}
      </Link>

      {/* تفاصيل المنتج والسعر بحواشي ملمومة */}
      <div className="flex flex-1 flex-col justify-between p-2 sm:p-2.5">
        <div className="space-y-0.5">
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

        <div className="mt-1.5 flex items-center justify-between gap-1.5 border-t border-border/30 pt-1.5">
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
