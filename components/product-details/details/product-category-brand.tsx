"use client"

/**
 * @file components/store/product-details/details/product-category-brand.tsx
 * @description Apple-inspired minimalist interactive display of product category and brand links.
 */

import * as React from "react"
import Link from "next/link"
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
      {/* رابط التصنيف */}
      {category && categoryName && (
        <Link
          href={`/${locale}/categories/${category.slug}`}
          className="tracking-wide uppercase transition-colors hover:text-primary hover:underline underline-offset-4"
        >
          {categoryName}
        </Link>
      )}

      {categoryName && brandName && (
        <span className="size-1 rounded-full bg-muted-foreground/40" />
      )}

      {/* رابط العلامة التجارية */}
      {brand && brandName && (
        <Link
          href={`/${locale}/brands/${brand.slug}`}
          className="font-semibold text-foreground tracking-wide transition-colors hover:text-primary hover:underline underline-offset-4"
        >
          {brandName}
        </Link>
      )}
    </div>
  )
}