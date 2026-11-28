"use client"

/**
 * @file components/store/product-details/details/product-info-section.tsx
 * @description Master component orchestrating all product information pieces with advanced attribute-based variant parsing.
 */

import * as React from "react"
import { useTranslations } from "next-intl"
import { ProductHeader } from "./product-header"
import { ProductDescription } from "./product-description"
import { ProductGallery } from "./product-gallery"
import { ProductVariants, type VariantOption } from "./product-variants"
import { ProductPriceStock } from "./product-price-stock"
import { ProductActions } from "./product-actions"
import { ProductCategoryBrand } from "./product-category-brand"
import { ProductTrustBadges } from "./ProductTrustBadges"
import {
  findBestVariant,
  getAttribute,
  getDiscountPercentage,
  isVariantOutOfStock,
} from "./variant-utils"
import type {
  FullProductDetails,
  ProductVariantDetail,
} from "@/lib/actions/store/product-details/details/queries/get-product-details"

const DEFAULT_OPTION_ID = "default-variant"

interface ProductInfoSectionProps {
  product: FullProductDetails
}

export function ProductInfoSection({ product }: ProductInfoSectionProps) {
  const t = useTranslations("ProductDetails")
  const variants = product.product_variants

  // نخزن المعرّف فقط، حتى تبقى بيانات المتغير (السعر والمخزون) محدثة دائماً
  const [selectedId, setSelectedId] = React.useState<string | undefined>(
    () => (variants.find((v) => !isVariantOutOfStock(v)) ?? variants[0])?.id
  )
  const selectedVariant =
    variants.find((v) => v.id === selectedId) ?? variants[0]

  const variantOptions = React.useMemo<VariantOption[]>(() => {
    if (!selectedVariant) return []

    const attributeKeys = Array.from(
      new Set(variants.flatMap((v) => Object.keys(v.attributes ?? {})))
    )

    // لا توجد attributes: نعرض أسماء المتغيرات نفسها
    if (attributeKeys.length === 0) {
      if (variants.length < 2) return []
      return [
        {
          id: DEFAULT_OPTION_ID,
          name: t("OPTION"),
          values: variants.map((v) => ({
            id: v.id,
            name: v.name ?? v.sku,
            isSelected: selectedVariant.id === v.id,
            isDisabled: isVariantOutOfStock(v),
          })),
        },
      ]
    }

    return attributeKeys.map((key) => {
      const values = Array.from(
        new Set(
          variants
            .map((v) => getAttribute(v, key))
            .filter((value): value is string => value !== null)
        )
      )

      return {
        id: key,
        name: key,
        values: values.map((value) => {
          const matches = variants.filter((v) => getAttribute(v, key) === value)
          return {
            id: value,
            name: value,
            isSelected: getAttribute(selectedVariant, key) === value,
            // معطّل فقط إذا نفدت كل المتغيرات التي تحمل هذه القيمة
            isDisabled: matches.every(isVariantOutOfStock),
          }
        }),
      }
    })
  }, [variants, selectedVariant, t])

  const handleSelectVariant = React.useCallback(
    (variant: ProductVariantDetail) => setSelectedId(variant.id),
    []
  )

  const handleSelectOption = (optionId: string, valueId: string) => {
    if (!selectedVariant) return
    const found =
      optionId === DEFAULT_OPTION_ID
        ? variants.find((v) => v.id === valueId)
        : findBestVariant(variants, selectedVariant, optionId, valueId)
    if (found) handleSelectVariant(found)
  }

  return (
    <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-12 lg:gap-14">
      {/* معرض الصور: يبقى ظاهراً أثناء التمرير على الشاشات الكبيرة */}
      <div className="min-w-0 md:sticky md:top-24 md:col-span-6 lg:col-span-7">
        <ProductGallery
          images={product.product_images}
          variants={variants}
          productName={product.name}
          selectedVariantId={selectedVariant?.id}
          isOutOfStock={
            selectedVariant ? isVariantOutOfStock(selectedVariant) : false
          }
          discountPercentage={
            selectedVariant ? getDiscountPercentage(selectedVariant) : null
          }
          onVariantSelect={handleSelectVariant}
        />
      </div>

      {/* المعلومات والخيارات وشريط الشراء */}
      <div className="flex min-w-0 flex-col gap-6 md:col-span-6 lg:col-span-5">
        <div className="space-y-2">
          <ProductCategoryBrand
            slug={product.slug}
            category={product.category}
            brand={product.brand}
          />
          <ProductHeader name={product.name} />
        </div>

        {selectedVariant ? (
          <>
            <ProductPriceStock variant={selectedVariant} />
            <ProductVariants
              options={variantOptions}
              onSelectOption={handleSelectOption}
            />
            <ProductActions
              productId={product.id}
              variant={selectedVariant}
              isProductActive={product.is_active}
            />
          </>
        ) : (
          <p className="rounded-2xl bg-muted/50 p-4 text-sm text-muted-foreground">
            {t("UNAVAILABLE_PRODUCT")}
          </p>
        )}

        <ProductTrustBadges />

        {/* الوصف بعد الشراء حتى لا يدفع النص الطويل الخيارات إلى الأسفل */}
        {product.description && (
          <ProductDescription description={product.description} />
        )}
      </div>
    </div>
  )
}
