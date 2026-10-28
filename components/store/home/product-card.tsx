"use client"

/**
 * @file components/store/home/product-card.tsx
 * @description Clean, minimalist Apple-inspired product card component supporting both vertical and horizontal layouts, fully clickable with localized routing and AspectRatio wrapped images.
 */

import * as React from "react"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { ShoppingCartIcon, Loader2Icon, StarIcon } from "lucide-react"
import { useCurrency } from "@/lib/context/currency-context"
import { useCart } from "@/lib/context/cart-context"
import { SimplifiedRegularProduct } from "@/lib/actions/store/queries/get-latest-regular-products"
import { AspectRatio } from "@/components/ui/aspect-ratio"

interface ProductCardProps {
  product: SimplifiedRegularProduct
  layout?: "vertical" | "horizontal"
}

export function ProductCard({ product, layout = "vertical" }: ProductCardProps) {
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
    e.stopPropagation() // لمنع انتقال الحدث (Click) للرابط الرئيسي عند النقر على زر السلة
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

  // ==================== 1. التصميم الأفقي (Horizontal Layout) ====================
  if (layout === "horizontal") {
    return (
      <Link
        href={`/product/${product.slug}`}
        className="group relative flex items-center gap-3 overflow-hidden rounded-2xl bg-muted/50 p-2.5 transition-all duration-300 hover:bg-muted/40"
      >
        {/* Image Container with Aspect Ratio */}
        <div className="relative w-20 shrink-0 overflow-hidden rounded-xl bg-background/50 sm:w-24">
          <AspectRatio ratio={1 / 1} className="w-full">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.image_alt || product.name}
                className="size-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-[10px] text-muted-foreground">
                No image
              </div>
            )}
          </AspectRatio>

          {/* Discount Badge */}
          {discountPercentage && (
            <span className="absolute inset-s-1.5 top-1.5 z-10 rounded-full bg-background/80 px-1.5 py-0.5 text-[9px] font-medium text-destructive backdrop-blur-md">
              -{discountPercentage}%
            </span>
          )}
        </div>

        {/* Content Area */}
        <div className="flex flex-1 flex-col justify-between py-0.5">
          <div className="space-y-0.5">
            <h3 className="line-clamp-1 text-xs font-medium text-foreground transition-colors group-hover:text-primary sm:text-sm">
              {product.name}
            </h3>

            {product.description && (
              <p className="line-clamp-1 text-[11px] text-muted-foreground/80">
                {product.description}
              </p>
            )}

            {/* Ratings */}
            {product.review_count > 0 && (
              <div className="flex items-center gap-1 pt-0.5 text-[10px] text-muted-foreground">
                <StarIcon className="size-2.5 fill-amber-500 text-amber-500" />
                <span className="font-medium text-foreground">{product.rating}</span>
                <span className="text-muted-foreground/70">({product.review_count})</span>
              </div>
            )}
          </div>

          {/* Price & Action Row */}
          <div className="flex items-center justify-between pt-1.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs font-semibold text-foreground sm:text-sm">
                {product.price !== null ? formatRawPrice(product.price) : "—"}{" "}
                {currentCurrency.symbol}
              </span>

              {hasDiscount && product.compare_at_price !== null && (
                <span className="text-[10px] text-destructive line-through">
                  {formatRawPrice(product.compare_at_price ?? 0)}{" "}
                  {currentCurrency.symbol}
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
      </Link>
    )
  }

  // ==================== 2. التصميم العامودي (Vertical Layout - Default) ====================
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-muted/50 p-2.5 transition-all duration-300 hover:bg-muted/40"
    >
      {/* Image Container with Aspect Ratio */}
      <div className="relative w-full overflow-hidden rounded-xl bg-background/50">
        <AspectRatio ratio={1 / 1} className="w-full">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.image_alt || product.name}
              className="size-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-[11px] text-muted-foreground">
              No image
            </div>
          )}
        </AspectRatio>

        {/* Discount Badge */}
        {discountPercentage && (
          <span className="absolute inset-s-2 top-2 z-10 rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-medium text-destructive backdrop-blur-md">
            -{discountPercentage}%
          </span>
        )}
      </div>

      {/* Content Area */}
      <div className="mt-2 flex flex-1 flex-col justify-between gap-2 px-1">
        <div className="space-y-1">
          {/* اسم المنتج */}
          <h3 className="line-clamp-1 text-xs font-medium text-foreground transition-colors group-hover:text-primary sm:text-sm">
            {product.name}
          </h3>

          {/* الوصف */}
          {product.description && (
            <p className="line-clamp-1 text-[11px] text-muted-foreground/80">
              {product.description}
            </p>
          )}

          {/* التقييمات والنجوم */}
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
        </div>

        {/* Price & Action Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            {/* السعر الحالي */}
            <span className="text-xs font-semibold text-foreground sm:text-sm">
              {product.price !== null ? formatRawPrice(product.price) : "—"}{" "}
              {currentCurrency.symbol}
            </span>

            {/* السعر القديم باللون الأحمر */}
            {hasDiscount && product.compare_at_price !== null && (
              <span className="text-[11px] text-destructive line-through">
                {formatRawPrice(product.compare_at_price ?? 0)}{" "}
                {currentCurrency.symbol}
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
    </Link>
  )
}