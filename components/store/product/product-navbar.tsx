/**
 * @file components/store/product/product-navbar.tsx
 * @description Simplified product navigation bar container.
 */

import * as React from "react"

interface ProductNavbarProps {
  productName?: string
}

export function ProductNavbar({ productName = "Product Details" }: ProductNavbarProps) {
  return (
    <header className="flex h-16 w-full items-center justify-between border-b px-4">
      <div>Back</div>
      <h1 className="font-medium">{productName}</h1>
      <div>Wishlist</div>
    </header>
  )
}