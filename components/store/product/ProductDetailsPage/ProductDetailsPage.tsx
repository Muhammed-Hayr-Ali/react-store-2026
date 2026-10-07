"use client"

import * as React from "react"
import { Separator } from "@/components/ui/separator"
import { ProductWithRelations } from "@/lib/actions/products/types"
import {
  ProductImageItem,
  ProductVariantItem,
  resolveVariantImage,
} from "./utils"
import { ProductHeader } from "./ProductHeader"
import { ProductVariantSelector } from "./ProductVariantSelector"
import { ProductActions } from "./ProductActions"
import { ProductTrustBadges } from "./ProductTrustBadges"
import { FlashSaleCountdown } from "./FlashSaleCountdown"
import { ProductGallery } from "./ProductGallery"

interface ProductDetailsProps {
  product: ProductWithRelations
}

export default function ProductDetailsPage({ product }: ProductDetailsProps) {
  const availableVariants = React.useMemo(
    () => product.product_variants.filter((v) => v.is_active),
    [product.product_variants]
  )

  const attributeOptions = React.useMemo(() => {
    const options: Record<string, string[]> = {}
    availableVariants.forEach((v) => {
      if (v.attributes) {
        Object.entries(v.attributes).forEach(([key, value]) => {
          if (!options[key]) options[key] = []
          if (!options[key].includes(value)) {
            options[key].push(value)
          }
        })
      }
    })
    return options
  }, [availableVariants])

  const [selectedVariantId, setSelectedVariantId] = React.useState<string>(
    () => availableVariants[0]?.id || ""
  )

  const [selectedAttributes, setSelectedAttributes] = React.useState<
    Record<string, string>
  >(() => availableVariants[0]?.attributes || {})

  const selectedVariant = React.useMemo(() => {
    return (
      availableVariants.find((v) => v.id === selectedVariantId) ||
      availableVariants[0] ||
      null
    )
  }, [selectedVariantId, availableVariants])

  const [quantity, setQuantity] = React.useState(1)
  const productImages = product.product_images as ProductImageItem[]
  const [userSelectedImage, setUserSelectedImage] = React.useState<
    string | null
  >(null)

  const activeImage = React.useMemo(() => {
    if (userSelectedImage) return userSelectedImage
    return resolveVariantImage(
      selectedVariant,
      availableVariants,
      productImages
    )
  }, [userSelectedImage, selectedVariant, availableVariants, productImages])

  const handleAttributeSelect = (key: string, value: string) => {
    const candidateAttrs = { ...selectedAttributes, [key]: value }

    let matching = availableVariants.find(
      (v) =>
        v.attributes &&
        Object.entries(candidateAttrs).every(
          ([k, val]) => v.attributes[k] === val
        )
    )

    if (!matching) {
      matching = availableVariants.find(
        (v) => v.attributes && v.attributes[key] === value
      )
    }

    if (matching) {
      setSelectedVariantId(matching.id)
      setSelectedAttributes(matching.attributes || candidateAttrs)
    } else {
      setSelectedAttributes(candidateAttrs)
    }

    setUserSelectedImage(null)
    setQuantity(1)
  }

  const handleDirectVariantSelect = (v: ProductVariantItem) => {
    setSelectedVariantId(v.id)
    setSelectedAttributes(v.attributes || {})
    setUserSelectedImage(null)
    setQuantity(1)
  }

  const handleThumbnailClick = (img: ProductImageItem) => {
    setUserSelectedImage(img.url)
    if (img.variant_id) {
      const targetVariant = availableVariants.find(
        (v) => v.id === img.variant_id
      )
      if (targetVariant) {
        setSelectedVariantId(targetVariant.id)
        if (targetVariant.attributes) {
          setSelectedAttributes(targetVariant.attributes)
        }
      }
    }
  }

  const handleQuantityChange = (newQty: number) => {
    if (newQty < 1) return
    if (selectedVariant && newQty > selectedVariant.stock_quantity) return
    setQuantity(newQty)
  }

  const isOutOfStock = !selectedVariant || selectedVariant.stock_quantity === 0
  const isLowStock = Boolean(
    selectedVariant &&
    selectedVariant.stock_quantity > 0 &&
    selectedVariant.stock_quantity <= (selectedVariant.low_stock_threshold || 5)
  )

  const defaultDiscountPercentage =
    selectedVariant?.compare_at_price &&
    selectedVariant.compare_at_price > selectedVariant.price
      ? Math.round(
          ((selectedVariant.compare_at_price - selectedVariant.price) /
            selectedVariant.compare_at_price) *
            100
        )
      : null

  const hasFlashSale = Boolean(product.flash_sale_deal)
  const activeDiscountPercentage =
    product.flash_sale_deal?.calculated_percentage ?? defaultDiscountPercentage

  const totalPriceInCents = selectedVariant
    ? selectedVariant.price * quantity
    : 0

  return (
    <section className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-14">
      {/* المعرض المرئي */}
      <ProductGallery
        activeImage={activeImage}
        productName={product.name}
        productImages={productImages}
        isOutOfStock={isOutOfStock}
        discountPercentage={activeDiscountPercentage}
        onThumbnailClick={handleThumbnailClick}
      />

      {/* تفاصيل المنتج والخيارات */}
      <div className="space-y-6 lg:col-span-6">
        <ProductHeader
          productId={product.id}
          productName={product.name}
          categoryName={product.category?.name}
          categorySlug={product.category?.slug}
          brandName={product.brand?.name}
          brandSlug={product.brand?.slug}
          selectedVariant={selectedVariant}
          isOutOfStock={isOutOfStock}
          isLowStock={isLowStock}
          isFlashSale={Boolean(product.flash_sale_deal)}
          flashSalePercentage={activeDiscountPercentage}
          flashSaleSlug={product.flash_sale_deal?.slug}
          flashSaleTitle={product.flash_sale_deal?.title}
        />

        {/* عرض العدّاد التنازلي الحصري في حال وجود حملة فلاش سارية */}
        {hasFlashSale && product.flash_sale_deal?.end_time && (
          <FlashSaleCountdown
            endTime={product.flash_sale_deal.end_time}
            discountPercentage={activeDiscountPercentage}
          />
        )}

        <Separator />

        <ProductVariantSelector
          attributeOptions={attributeOptions}
          selectedAttributes={selectedAttributes}
          availableVariants={availableVariants}
          selectedVariant={selectedVariant}
          onAttributeSelect={handleAttributeSelect}
          onDirectVariantSelect={handleDirectVariantSelect}
        />

        <Separator />

        <ProductActions
          quantity={quantity}
          totalPriceInCents={totalPriceInCents}
          isOutOfStock={isOutOfStock}
          maxStock={selectedVariant?.stock_quantity ?? 0}
          onQuantityChange={handleQuantityChange}
        />

        <ProductTrustBadges />

        {product.description && (
          <div className="space-y-2 border-t border-border/60 pt-4">
            <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Overview
            </h3>
            <p className="text-sm leading-relaxed whitespace-pre-line text-foreground/90">
              {product.description}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
