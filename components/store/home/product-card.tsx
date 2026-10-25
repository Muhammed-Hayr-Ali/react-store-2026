"use client"

/**
 * @file components/store/home/product-card.tsx
 * @description Apple-inspired minimalist product card component with local loading state.
 */

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingCartIcon, Loader2Icon } from "lucide-react"
import { useCurrency } from "@/lib/context/currency-context"
import { useCart } from "@/lib/context/cart-context"
import { SimplifiedRegularProduct } from "@/lib/actions/store/queries/get-latest-regular-products"

interface ProductCardProps {
  product: SimplifiedRegularProduct
}

export function ProductCard({ product }: ProductCardProps) {
  const { formatRawPrice } = useCurrency()
  const { addItem } = useCart()

  // حالة تحميل محلية خاصة بهذا الكارد فقط
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

      // تنفيذ الإضافة للسلة بجانب ضمان ظهور أ حداقل مدة للتحميل (مثلاً نصف ثانية لتكون واضحة للعين)
      await Promise.all([
        addItem(product.id, product.variant_id, 1),
        new Promise((resolve) => setTimeout(resolve, 500)),
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card p-3 transition-all hover:border-border hover:shadow-sm">
      {/* Image Container */}
      <Link
        href={`/product/${product.slug}`}
        className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted/40"
      >
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.image_alt || product.name}
            className="size-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            No image
          </div>
        )}

        {/* Discount Badge */}
        {discountPercentage && (
          <span className="absolute inset-s-2.5 top-2.5 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive backdrop-blur-md">
            -{discountPercentage}%
          </span>
        )}
      </Link>

      {/* Content Area */}
      <div className="mt-3.5 flex flex-1 flex-col justify-between gap-3">
        <div className="space-y-1">
          <Link href={`/products/${product.slug}`}>
            <h3 className="line-clamp-1 text-xs font-semibold tracking-tight text-foreground transition-colors hover:text-primary sm:text-sm">
              {product.name}
            </h3>
          </Link>
          {product.description && (
            <p className="line-clamp-1 text-[11px] text-muted-foreground">
              {product.description}
            </p>
          )}
        </div>

        {/* Price & Action Row */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-sm font-bold text-foreground">
              {product.price !== null ? formatRawPrice(product.price) : "—"}
            </span>
            {hasDiscount && product.compare_at_price !== null && (
              <span className="font-mono text-xs text-muted-foreground line-through">
                {formatRawPrice(product.compare_at_price ?? 0)}
              </span>
            )}
          </div>

          <Button
            size="icon"
            variant="outline"
            className="size-8 rounded-full shadow-none transition-transform active:scale-95"
            aria-label="Add to cart"
            disabled={isLoading}
            onClick={handleAddToCart}
          >
            {isLoading ? (
              <Loader2Icon className="size-3.5 animate-spin" />
            ) : (
              <ShoppingCartIcon className="size-3.5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
