"use client"

/**
 * @file components/store/product-details/details/product-info-section.tsx
 * @description Master component orchestrating all product information pieces with clean Apple-inspired layout.
 */

import * as React from "react"
import { ProductBreadcrumb } from "./product-breadcrumb"
import { ProductHeader } from "./product-header"
import { ProductGallery } from "./product-gallery"
import { ProductVariants } from "./product-variants"
import { ProductPriceStock } from "./product-price-stock"
import { ProductActions } from "./product-actions"
import { ProductCategoryBrand } from "./product-category-brand"
import { ProductTrustBadges } from "./ProductTrustBadges" // تأكد من مطابقة حالة الأحرف لاسم الملف الفعلية
import type {
  FullProductDetails,
  ProductVariantDetail,
} from "@/lib/actions/store/product-details/details/queries/get-product-details"

interface ProductInfoSectionProps {
  product: FullProductDetails
  locale: string
}

export function ProductInfoSection({
  locale,
  product,
}: ProductInfoSectionProps) {
  const [selectedVariant, setSelectedVariant] =
    React.useState<ProductVariantDetail>(product.product_variants[0])

  return (
    <div className="flex flex-col gap-8">
      {/* 0. مسار التنقل (Breadcrumb) */}
      <ProductBreadcrumb
        locale={locale}
        category={product.category}
        parentCategory={product.parent_category}
        productName={product.name}
      />

      {/* تخطيط الشبكة الرئيسي */}
      <div className="grid grid-cols-1 items-start gap-12 md:grid-cols-12">
        {/* القسم الأيسر: معرض الصور الفاخر */}
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

        {/* القسم الأيمن: المعلومات والخيارات وأزرار الشراء */}
        <div className="flex flex-col gap-6 md:col-span-6">
          <ProductCategoryBrand
            locale={locale}
            category={product.category}
            brand={product.brand}
          />

          <ProductHeader
            name={product.name}
            description={product.description}
          />

          {selectedVariant && <ProductPriceStock variant={selectedVariant} />}

          <ProductVariants
            options={[
              {
                id: "default-option",
                name: "Options / Flavors",
                values: product.product_variants.map((v) => ({
                  id: v.id,
                  name: v.name,
                  isSelected: selectedVariant?.id === v.id,
                  isDisabled: v.track_inventory && v.stock_quantity <= 0,
                })),
              },
            ]}
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
