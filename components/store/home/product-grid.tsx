/**
 * @file components/store/home/product-grid.tsx
 * @description Responsive grid wrapper for product cards with internationalization support.
 */

import * as React from "react"
import { getTranslations } from "next-intl/server"
import { ProductCard } from "./product-card"
import { SimplifiedRegularProduct } from "@/lib/actions/store/queries/get-latest-regular-products"

interface ProductGridProps {
  products: SimplifiedRegularProduct[]
  emptyMessage?: string
}

export async function ProductGrid({
  products,
  emptyMessage,
}: ProductGridProps) {
  const t = await getTranslations("Home")

  const resolvedEmptyMessage = 
    emptyMessage || t("NO_PRODUCTS_AVAILABLE", { default: "No products available." })

  if (!products || products.length === 0) {
    return (
      <div className="flex min-h-37.5 w-full items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card/50 p-6 text-center text-xs text-muted-foreground">
        {resolvedEmptyMessage}
      </div>
    )
  }

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
          {t("NEW_ARRIVALS", { default: "New Arrivals" })}
        </h2>
        <p className="text-xs text-muted-foreground sm:text-sm">
          {t("NEW_ARRIVALS_DESC", { 
            default: "Explore our latest additions and everyday essentials." 
          })}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}