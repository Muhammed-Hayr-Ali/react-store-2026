"use client"

import * as React from "react"
import {
  LatestProductItem,
  CategoryProductItem,
} from "@/lib/actions/products/types"
import type { CurrencyCode } from "@/lib/actions/currency/types"
import { ProductCard } from "./product-card"

interface ProductsGridProps {
  title?: string
  products: (LatestProductItem | CategoryProductItem)[]
  currency: CurrencyCode
  exchangeRate: number
}

export default function ProductsGrid({
  title,
  products,
  currency,
  exchangeRate,
}: ProductsGridProps) {
  if (!products || products.length === 0) {
    return null
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      {title && (
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold tracking-tight text-foreground sm:text-xl">
            {title}
          </h2>
        </div>
      )}

      {/* شبكة متجاوبة ومدمجة للأجهزة المحمولة والشاشات الكبيرة */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-4 lg:grid-cols-5">
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
