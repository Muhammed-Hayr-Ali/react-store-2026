"use client"

/**
 * @file components/store/home/product-card.tsx
 * @description Apple-inspired minimalist product card component.
 */

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingCartIcon } from "lucide-react"

interface ProductCardProps {
  product: {
    id: string
    name: string
    slug: string
    description?: string | null
    price: number | null
    compare_at_price?: number | null
    image_url?: string | null
    image_alt?: string | null
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const hasDiscount =
    product.compare_at_price && product.compare_at_price > (product.price ?? 0)
  const discountPercentage = hasDiscount
    ? Math.round(
        ((product.compare_at_price! - product.price!) /
          product.compare_at_price!) *
          100
      )
    : null

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card p-3 transition-all hover:border-border hover:shadow-sm">
      {/* Image Container */}
      <Link
        href={`/products/${product.slug}`}
        className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted/40"
      >
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.image_alt || product.name}
            className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
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
              ${product.price}
            </span>
            {hasDiscount && (
              <span className="font-mono text-xs text-muted-foreground line-through">
                ${product.compare_at_price}
              </span>
            )}
          </div>

          <Button
            size="icon"
            variant="outline"
            className="size-8 rounded-full shadow-none transition-transform active:scale-95"
            aria-label="Add to cart"
            onClick={(e) => {
              e.preventDefault()
              // منطق إضافة المنتج للسلة هنا
            }}
          >
            <ShoppingCartIcon className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
