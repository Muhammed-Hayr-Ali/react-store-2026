/**
 * @file components/store/wishlist/products-grid.tsx
 * @description Responsive grid for wishlist items.
 */

import * as React from "react"
import { WishlistProductCard } from "./product-card"
import type { WishlistQueryResult } from "@/lib/actions/wishlists"

interface ProductsGridProps {
  items: WishlistQueryResult[]
  locale: string
}

export function ProductsGrid({ items, locale }: ProductsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {items.map((item) => (
        <WishlistProductCard key={item.id} item={item} locale={locale} />
      ))}
    </div>
  )
}