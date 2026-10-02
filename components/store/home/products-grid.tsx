"use client"

import * as React from "react"
import { LatestProductItem } from "@/lib/actions/products/types"
import type { CurrencyCode } from "@/lib/actions/currency/types"
import { ProductCard } from "./product-card"

interface ProductsGridProps {
  title?: string
  products: LatestProductItem[]
  currency: CurrencyCode
  exchangeRate: number
}

export default function ProductsGrid({
  title = "Latest Products",
  products,
  currency,
  exchangeRate,
}: ProductsGridProps) {
  if (!products || products.length === 0) {
    return null
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-6 sm:py-6">
      {title && (
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold tracking-tight text-foreground sm:text-xl">
            {title}
          </h2>
        </div>
      )}

      {/* تصغير حجم البطاقات عبر زيادة الأعمدة وتقليل الـ gap */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            currency={currency}
            exchangeRate={exchangeRate}
          />
        ))}
      </div>
    </section>
  )
}
