"use client"

/**
 * @file components/store/product-details/details/product-variants.tsx
 * @description Product variants selector component allowing users to switch between flavors, sizes, or options.
 */

import * as React from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { ProductVariantDetail } from "@/lib/actions/store/product-details/details/queries/get-product-details"

interface ProductVariantsProps {
  variants: ProductVariantDetail[]
  selectedVariant: ProductVariantDetail
  onVariantChange: (variant: ProductVariantDetail) => void
}

export function ProductVariants({
  variants,
  selectedVariant,
  onVariantChange,
}: ProductVariantsProps) {
  const t = useTranslations("ProductDetails")

  if (!variants || variants.length <= 1) {
    return null // إذا كان هناك متغير واحد فقط أو لا توجد متغيرات، فلا داعي لعرض القائمة
  }

  return (
    <div className="space-y-3">
      <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        {t("SELECT_VARIANT", { default: "Options / Flavors" })}
      </label>

      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => {
          const isSelected = variant.id === selectedVariant?.id

          return (
            <Button
              key={variant.id}
              type="button"
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={() => onVariantChange(variant)}
              className={`h-9 px-4 text-xs font-medium transition-all ${
                isSelected
                  ? "shadow-sm"
                  : "bg-muted/30 text-foreground hover:bg-muted/60"
              }`}
            >
              {variant.name}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
