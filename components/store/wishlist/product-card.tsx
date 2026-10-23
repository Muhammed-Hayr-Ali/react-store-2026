/**
 * @file components/store/wishlist/product-card.tsx
 * @description Wishlist product card component with translation support.
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useCurrency } from "@/lib/context/currency-context"
import { useWishlist } from "@/lib/context/wishlist-context"
import type { WishlistQueryResult } from "@/lib/actions/wishlists"

interface WishlistProductCardProps {
  item: WishlistQueryResult
  locale: string
}

export function WishlistProductCard({ item, locale }: WishlistProductCardProps) {
  const t = useTranslations("Wishlist")
  const { formatRawPrice, currentCurrency } = useCurrency()
  const { toggleWishlist, isPending } = useWishlist()

  const product = item.products
  if (!product) return null

  const primaryImage =
    product.product_images?.find((img) => img.is_primary)?.url ||
    product.product_images?.[0]?.url ||
    "/placeholder.svg"

  const variantPrice = product.product_variants?.[0]?.price || 0

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card p-4 shadow-sm transition-all hover:shadow-md">
      {/* زر الحذف السريع من المفضلة */}
      <div className="absolute top-3 inset-e-3 z-10">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={isPending}
          onClick={() => toggleWishlist(product.id)}
          className="size-8 rounded-full bg-background/80 text-muted-foreground backdrop-blur-sm transition-colors hover:bg-destructive hover:text-destructive-foreground"
          aria-label={t("REMOVE_FROM_WISHLIST")}
        >
          <Trash2Icon className="size-4" />
        </Button>
      </div>

      {/* صورة المنتج */}
      <Link
        href={`/${locale}/product-details/${product.slug}`}
        className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted/40 mb-3"
      >
        <img
          src={primaryImage}
          alt={product.name}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </Link>

      {/* تفاصيل المنتج */}
      <div className="flex flex-1 flex-col justify-between space-y-2">
        <div>
          {product.brand && (
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              {product.brand.name_ar || product.brand.name}
            </span>
          )}
          <Link href={`/${locale}/product-details/${product.slug}`}>
            <h3 className="line-clamp-1 text-sm font-semibold text-foreground hover:underline">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* السعر */}
        <div className="flex items-baseline gap-1 pt-1">
          <span className="text-base font-bold text-foreground">
            {formatRawPrice(variantPrice)}
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            {currentCurrency.symbol}
          </span>
        </div>
      </div>
    </div>
  )
}