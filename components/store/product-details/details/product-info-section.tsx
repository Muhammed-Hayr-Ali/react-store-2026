"use client"

/**
 * @file components/store/product-details/details/product-info-section.tsx
 * @description Master component orchestrating all product information puzzle pieces including breadcrumb.
 */

import * as React from "react"
import { ProductBreadcrumb } from "./product-breadcrumb"

import { ProductHeader } from "./product-header"
import { ProductGallery } from "./product-gallery"
import { ProductVariants } from "./product-variants"
import { ProductPriceStock } from "./product-price-stock"
import { ProductActions } from "./product-actions"
import {
  FullProductDetails,
  ProductVariantDetail,
} from "@/lib/actions/store/product-details/details/queries/get-product-details"
import { ProductCategoryBrand } from "./product-category-brand"
import { ProductTrustBadges } from "./ProductTrustBadges"

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
    <div className="flex flex-col gap-6">
      {/* 0. مسار التنقل (Breadcrumb) في أعلى الصفحة */}
      <ProductBreadcrumb
        locale={locale}
        category={product.category}
        parentCategory={product.parent_category}
        productName={product.name}
      />

      {/* بقية القطع منظمة داخل شبكة */}
      <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-12">
        {/* القسم الأيسر: معرض الصور */}
        <div className="md:col-span-6">
          <ProductGallery
            images={product.product_images}
            variants={product.product_variants}
            productName={product.name}
            selectedVariantSku={selectedVariant?.sku}
            onVariantSelect={setSelectedVariant}
          />
        </div>

        {/* القسم الأيمن: تفاصيل ومعلومات المنتج */}
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
            variants={product.product_variants}
            selectedVariant={selectedVariant}
            onVariantChange={setSelectedVariant}
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
