/**
 * @file components/store/home/product-grid.tsx
 * @description Responsive grid wrapper for product cards.
 */

import * as React from "react"
import { ProductCard } from "./product-card"

interface ProductItem {
  id: string
  name: string
  slug: string
  description?: string | null
  price: number | null
  compare_at_price?: number | null
  image_url?: string | null
  image_alt?: string | null
}

interface ProductGridProps {
  products: ProductItem[]
  emptyMessage?: string
}

export function ProductGrid({ 
  products, 
  emptyMessage = "No products available." 
}: ProductGridProps) {
  if (!products || products.length === 0) {
    return (
      <div className="flex min-h-37.5 w-full items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card/50 p-6 text-center text-xs text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 sm:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}