"use client"

/**
 * @file components/store/product-details/details/product-category-brand.tsx
 * @description Apple-inspired minimalist interactive display of product category and brand links with robust fallback to English names if Arabic name is missing.
 */

import * as React from "react"
import Link from "next/link"
import {
  BrandDetail,
  CategoryDetail,
} from "@/lib/actions/store/product-details/details/queries/get-product-details"
import { Button } from "@/components/ui/button"
import { PenLineIcon } from "lucide-react"
import { Can } from "@/components/shared/can"
import { PERMISSIONS } from "@/lib/actions/role"

interface ProductCategoryBrandProps {
  locale: string
  slug: string
  category?: CategoryDetail | null
  brand?: BrandDetail | null
}

export function ProductCategoryBrand({
  locale,
  slug,
  category,
  brand,
}: ProductCategoryBrandProps) {
  if (!category && !brand) return null

  // استخدام الاسم العربي إن وجد عند تفعيل العربية، وإلا التراجع للإنكليزية (fallback)
  const categoryName = category
    ? locale === "ar"
      ? category.name_ar || category.name
      : category.name
    : null

  const brandName = brand
    ? locale === "ar"
      ? brand.name_ar || brand.name
      : brand.name
    : null

  return (
    <div className="flex justify-between">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground/80">
        {/* رابط التصنيف */}
        {category && categoryName && (
          <Link
            href={`/${locale}/categories/${category.slug}`}
            className="tracking-wide uppercase underline-offset-4 transition-colors hover:text-primary hover:underline"
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
            className="font-semibold tracking-wide text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            {brandName}
          </Link>
        )}
      </div>
      <Can permission={PERMISSIONS.UPDATE_PRODUCT}>
        <Button
          size="icon-sm"
          className="rounded-full bg-foreground shadow-none"
          asChild
        >
          <Link href={`/dashboard/products/${slug}/edit`}>
            <PenLineIcon className="text-background"/>
          </Link>
        </Button>
      </Can>
    </div>
  )
}
