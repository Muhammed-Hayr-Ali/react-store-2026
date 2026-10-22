"use client"

/**
 * @file components/store/product-details/details/product-category-brand.tsx
 * @description Apple-inspired minimalist display of product category and brand.
 */

import * as React from "react"
import {
  BrandDetail,
  CategoryDetail,
} from "@/lib/actions/store/product-details/details/queries/get-product-details"

interface ProductCategoryBrandProps {
  locale: string
  category?: CategoryDetail | null
  brand?: BrandDetail | null
}

export function ProductCategoryBrand({
  locale,
  category,
  brand,
}: ProductCategoryBrandProps) {
  if (!category && !brand) return null

  const categoryName = category
    ? locale === "ar"
      ? category.name_ar
      : category.name
    : null

  const brandName = brand
    ? locale === "ar"
      ? brand.name_ar
      : brand.name
    : null

  return (
    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground/80">
      {/* اسم أو تصنيف المنتج بأسلوب نظيف */}
      {categoryName && (
        <span className="tracking-wide uppercase">
          {categoryName}
        </span>
      )}

      {categoryName && brandName && (
        <span className="size-1 rounded-full bg-muted-foreground/40" />
      )}

      {brandName && (
        <span className="font-semibold text-foreground tracking-wide">
          {brandName}
        </span>
      )}
    </div>
  )
}