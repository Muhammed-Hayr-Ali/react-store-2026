"use client"

/**
 * @file components/store/home/product-card.tsx
 * @description Clean, minimalist Apple-inspired product card component with refined currency styling.
 */

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingCartIcon, Loader2Icon, StarIcon } from "lucide-react"
import { useCurrency } from "@/lib/context/currency-context"
import { useCart } from "@/lib/context/cart-context"
import { SimplifiedRegularProduct } from "@/lib/actions/store/queries/get-latest-regular-products"

interface ProductCardProps {
  product: SimplifiedRegularProduct
}

export function ProductCard({ product }: ProductCardProps) {
  const { formatRawPrice, currentCurrency } = useCurrency()
  const { addItem } = useCart()
  const [isLoading, setIsLoading] = React.useState(false)

  const hasDiscount =
    product.compare_at_price && product.compare_at_price > (product.price ?? 0)
  const discountPercentage = hasDiscount
    ? Math.round(
        ((product.compare_at_price! - product.price!) /
          product.compare_at_price!) *
          100
      )
    : null

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!product.price || !product.variant_id) return

    try {
      setIsLoading(true)
      await Promise.all([
        addItem(product.id, product.variant_id, 1),
        new Promise((resolve) => setTimeout(resolve, 400)),
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-muted/20 p-2.5 transition-all duration-300 hover:bg-muted/40">
      {/* Image Container */}
      <Link
        href={`/product/${product.slug}`}
        className="relative aspect-square w-full overflow-hidden rounded-xl bg-background/50"
      >
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.image_alt || product.name}
            className="size-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[11px] text-muted-foreground">
            No image
          </div>
        )}

        {/* Discount Badge */}
        {discountPercentage && (
          <span className="absolute inset-s-2 top-2 rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-medium text-destructive backdrop-blur-md">
            -{discountPercentage}%
          </span>
        )}
      </Link>

      {/* Content Area */}
      <div className="mt-3 flex flex-1 flex-col justify-between gap-2.5 px-1">
        <div className="space-y-1">
          {/* Ratings */}
          {product.review_count > 0 && (
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <StarIcon className="size-3 fill-amber-500 text-amber-500" />
              <span className="font-medium text-foreground">
                {product.rating}
              </span>
              <span className="text-muted-foreground/70">
                ({product.review_count})
              </span>
            </div>
          )}

          <Link href={`/product/${product.slug}`}>
            <h3 className="line-clamp-1 text-xs font-medium text-foreground transition-colors group-hover:text-primary sm:text-sm">
              {product.name}
            </h3>
          </Link>

          {product.description && (
            <p className="line-clamp-1 text-[11px] text-muted-foreground/80">
              {product.description}
            </p>
          )}
        </div>

        {/* Price & Action Row */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-baseline gap-1.5">
            {/* السعر الحالي مع تنسيق مميز لرمز العملة */}
            <span className="font-mono text-xs font-semibold text-foreground sm:text-sm flex items-baseline gap-1">
              <span>{product.price !== null ? formatRawPrice(product.price) : "—"}</span>
              <span className="text-[10px] font-normal text-muted-foreground">
                {currentCurrency.symbol}
              </span>
            </span>

            {/* السعر القديم (قبل الخصم) مع شطب ورمز مصغر */}
            {hasDiscount && product.compare_at_price !== null && (
              <span className="font-mono text-[11px] text-muted-foreground/70 line-through flex items-baseline gap-0.5">
                <span>{formatRawPrice(product.compare_at_price ?? 0)}</span>
                <span className="text-[9px] font-normal">
                  {currentCurrency.symbol}
                </span>
              </span>
            )}
          </div>

          <Button
            size="icon"
            variant="secondary"
            className="size-7 rounded-full bg-background shadow-xs transition-transform hover:bg-background/90 active:scale-95"
            aria-label="Add to cart"
            disabled={isLoading}
            onClick={handleAddToCart}
          >
            {isLoading ? (
              <Loader2Icon className="size-3.5 animate-spin text-primary" />
            ) : (
              <ShoppingCartIcon className="size-3.5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}