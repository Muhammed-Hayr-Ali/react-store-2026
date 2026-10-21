"use client"

/**
 * @file components/store/product-details/details/product-category-brand.tsx
 * @description Displays product category badge and brand information side-by-side.
 */

import * as React from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
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
    <div className="flex flex-wrap items-center gap-3">
      {/* شارة التصنيف */}
      {category && (
        <Badge
          variant="secondary"
          className="px-3 py-1 text-xs font-medium transition-colors hover:bg-secondary/80"
        >
          {categoryName}
        </Badge>
      )}

      {/* شارة أو اسم العلامة التجارية */}
      {brand && (
        <Badge
          variant="outline"
          className="flex items-center gap-2 border-border/60 px-3 py-1 text-xs font-medium transition-colors group-hover:border-primary/50"
        >
          <span className="text-muted-foreground transition-colors group-hover:text-foreground">
            {brandName}
          </span>
        </Badge>
      )}
    </div>
  )
}
