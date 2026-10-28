"use client"

/**
 * @file components/store/product-details/details/product-info-section.tsx
 * @description Master component orchestrating all product information pieces with advanced attribute-based variant parsing.
 */

import * as React from "react"
import { ProductBreadcrumb } from "./product-breadcrumb"
import { ProductHeader } from "./product-header"
import { ProductGallery } from "./product-gallery"
import { ProductVariants } from "./product-variants"
import { ProductPriceStock } from "./product-price-stock"
import { ProductActions } from "./product-actions"
import { ProductCategoryBrand } from "./product-category-brand"
import { ProductTrustBadges } from "./ProductTrustBadges"
import type {
  FullProductDetails,
  ProductVariantDetail,
} from "@/lib/actions/store/product-details/details/queries/get-product-details"
import { useTranslations } from "next-intl"

interface ProductInfoSectionProps {
  product: FullProductDetails
  locale: string
}

export function ProductInfoSection({
  locale,
  product,
}: ProductInfoSectionProps) {
  const t = useTranslations("ProductDetails")
  const [selectedVariant, setSelectedVariant] =
    React.useState<ProductVariantDetail>(product.product_variants[0])

  /**
   * استخراج الخصائص (Attributes) ديناميكياً من الـ variants (مثل size, weight)
   * وعرضها كخيارات مستقلة ودقيقة للمستخدم.
   */
  const variantOptions = React.useMemo(() => {
    if (!product.product_variants || product.product_variants.length === 0)
      return []

    // تجميع الخصائص الفريدة من جميع الـ variants (مثلاً: استخراج مفاتيح الـ attributes مثل size)
    const attributeKeys = new Set<string>()
    product.product_variants.forEach((v) => {
      if (v.attributes && typeof v.attributes === "object") {
        Object.keys(v.attributes).forEach((key) => attributeKeys.add(key))
      }
    })

    // إذا لم تكن هناك attributes مفصلة، نرجع النكهة/الاسم الأساسي كخيار
    if (attributeKeys.size === 0) {
      return [
        {
          id: "default-variant",
          name: t("OPTION", { default: "Option" }),
          values: product.product_variants.map((v) => ({
            id: v.id,
            name: v.name,
            isSelected: selectedVariant?.id === v.id,
            isDisabled: v.track_inventory && v.stock_quantity <= 0,
          })),
        },
      ]
    }

    // بناء قائمة الخيارات بناءً على كل attribute تم العثور عليه (مثل Size و Weight)
    const options: Array<{
      id: string
      name: string
      values: Array<{
        id: string
        name: string
        isSelected: boolean
        isDisabled?: boolean
      }>
    }> = []

    attributeKeys.forEach((attrKey) => {
      // جمع القيم الفريدة لكل خاصية
      const uniqueValues = new Map<
        string,
        { id: string; name: string; isDisabled: boolean }
      >()

      product.product_variants.forEach((v) => {
        const attrVal = v.attributes?.[attrKey]
        if (attrVal) {
          const stringVal = String(attrVal)
          if (!uniqueValues.has(stringVal)) {
            uniqueValues.set(stringVal, {
              id: v.id, // ربط القيمة بأول variant يمتلكها أو معالجتها حسب منطق التصفية
              name: stringVal,
              isDisabled: v.track_inventory && v.stock_quantity <= 0,
            })
          }
        }
      })

      if (uniqueValues.size > 0) {
        options.push({
          id: attrKey,
          name: attrKey.toUpperCase(), // عرض اسم الخاصية مثل SIZE أو WEIGHT
          values: Array.from(uniqueValues.entries()).map(([valStr, data]) => ({
            id: data.id,
            name: valStr,
            isSelected: selectedVariant?.attributes?.[attrKey] === valStr,
            isDisabled: data.isDisabled,
          })),
        })
      }
    })

    return options
  }, [product.product_variants, selectedVariant, t])

  return (
    <div className="flex flex-col gap-8">
      {/* ================================================================= */}
      {/* 0. مسار التنقل (Breadcrumb) */}
      {/* ================================================================= */}
      <ProductBreadcrumb
        locale={locale}
        category={product.category}
        parentCategory={product.parent_category}
        productName={product.name}
      />

      {/* تخطيط الشبكة الرئيسي */}
      <div className="grid grid-cols-1 items-start gap-12 md:grid-cols-12">
        {/* ================================================================= */}
        {/* 1. قسم معرض الصور الفاخر */}
        {/* ================================================================= */}
        <div className="md:col-span-6">
          <ProductGallery
            images={product.product_images}
            variants={product.product_variants}
            productName={product.name}
            selectedVariantSku={selectedVariant?.sku}
            isOutOfStock={
              selectedVariant?.track_inventory &&
              selectedVariant?.stock_quantity <= 0
            }
            onVariantSelect={setSelectedVariant}
          />
        </div>

        {/* ================================================================= */}
        {/* 2. قسم المعلومات والخيارات وأزرار الشراء */}
        {/* ================================================================= */}
        <div className="flex flex-col gap-6 md:col-span-6">
          <ProductCategoryBrand
            slug={product.slug}
            locale={locale}
            category={product.category}
            brand={product.brand}
          />

          <ProductHeader
            name={product.name}
            description={product.description}
          />

          {selectedVariant && <ProductPriceStock variant={selectedVariant} />}

          {/* خيارات المنتج المستخرجة بدقة من السمات (Attributes) */}
          <ProductVariants
            options={variantOptions}
            onSelectOption={(_optionId, valueId) => {
              const found = product.product_variants.find(
                (v) => v.id === valueId
              )
              if (found) {
                setSelectedVariant(found)
              }
            }}
          />

          {selectedVariant && (
            <ProductActions
              productId={product.id}
              variant={selectedVariant}
              isProductActive={product.is_active}
            />
          )}

          <ProductTrustBadges />
        </div>
      </div>
    </div>
  )
}
