"use client"

import * as React from "react"
import { CheckIcon, ShoppingCartIcon, AlertCircleIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ProductWithRelations } from "@/lib/actions/products/types"

interface ProductDetailsProps {
  product: ProductWithRelations
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: "SAR",
    minimumFractionDigits: 0,
  }).format(price)
}

export default function ProductDetailsPage({ product }: ProductDetailsProps) {
  const availableVariants = product.product_variants.filter((v) => v.is_active)
  const [selectedVariant, setSelectedVariant] = React.useState(
    availableVariants[0] || null
  )

  // تحديد الصورة النشطة من مصفوفة الصور مباشرة
  const defaultImageObj =
    product.product_images.find((img) => img.is_primary) ||
    product.product_images[0] ||
    null

  const [activeImage, setActiveImage] = React.useState<string>(
    defaultImageObj ? defaultImageObj.url : ""
  )

  const handleVariantSelect = (variant: typeof selectedVariant) => {
    setSelectedVariant(variant)
    if (variant) {
      const variantImg = product.product_images.find(
        (img) => img.variant_id === variant.id
      )
      if (variantImg) {
        setActiveImage(variantImg.url)
      } else {
        setActiveImage(defaultImageObj ? defaultImageObj.url : "")
      }
    }
  }

  const discountPercentage =
    selectedVariant?.compare_at_price &&
    selectedVariant.compare_at_price > selectedVariant.price
      ? Math.round(
          ((selectedVariant.compare_at_price - selectedVariant.price) /
            selectedVariant.compare_at_price) *
            100
        )
      : null

  const isOutOfStock = selectedVariant
    ? selectedVariant.stock_quantity === 0
    : true

  return (
    <div className="mx-auto w-full max-w-6xl py-12 md:py-20">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
        {/* --- قسم معرض الصور --- */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted/20">
            {activeImage ? (
              <img
                src={activeImage}
                alt={product.name}
                className="h-full w-full object-cover transition-opacity duration-300"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center text-sm text-muted-foreground">
                <AlertCircleIcon className="mb-2 size-8 opacity-40" />
                <span>لا توجد صورة متوفرة</span>
              </div>
            )}

            {discountPercentage && (
              <span className="text-destructive-foreground absolute end-4 top-4 rounded-full bg-destructive px-3 py-1 text-xs font-semibold">
                خصم {discountPercentage}%
              </span>
            )}
          </div>

          {/* الصور المصغرة */}
          {product.product_images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.product_images.map((img) => {
                const isSelected = activeImage === img.url
                return (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setActiveImage(img.url)}
                    className={`relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted/20 transition-all ${
                      isSelected
                        ? "ring-2 ring-primary"
                        : "opacity-60 hover:opacity-100"
                    }`}
                    aria-label={`عرض صورة ${img.alt_text || product.name}`}
                  >
                    <img
                      src={img.url}
                      alt={img.alt_text || product.name}
                      className="h-full w-full object-cover"
                    />
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* --- تفاصيل وخيارات المنتج --- */}
        <div className="flex flex-col justify-center space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {product.category && (
                <span>{product.category.name_ar || product.category.name}</span>
              )}
              {product.category && product.brand && <span>•</span>}
              {product.brand && (
                <span>{product.brand.name_ar || product.brand.name}</span>
              )}
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-3xl font-extrabold text-foreground">
                {selectedVariant
                  ? formatPrice(selectedVariant.price)
                  : formatPrice(0)}
              </span>
              {selectedVariant?.compare_at_price &&
                selectedVariant.compare_at_price > selectedVariant.price && (
                  <span className="text-base text-muted-foreground line-through">
                    {formatPrice(selectedVariant.compare_at_price)}
                  </span>
                )}
            </div>
          </div>

          <Separator />

          {/* المتغيرات */}
          {availableVariants.length > 0 && (
            <div className="space-y-3">
              <span className="text-sm font-medium text-foreground">
                المواصفات المتاحة
              </span>
              <div className="flex flex-wrap gap-2.5 pt-4 ">
                {availableVariants.map((v) => {
                  const isCurrent = selectedVariant?.id === v.id
                  const isDisabled = v.stock_quantity === 0

                  return (
                    <button
                      key={v.id}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => handleVariantSelect(v)}
                      className={`flex flex-col items-start rounded-lg px-4 py-2.5 text-start text-xs transition-colors ${
                        isCurrent
                          ? "bg-primary font-semibold text-primary-foreground"
                          : isDisabled
                            ? "cursor-not-allowed bg-muted/30 text-muted-foreground line-through opacity-40"
                            : "bg-muted/40 text-foreground hover:bg-muted/70"
                      }`}
                    >
                      <span>{v.name || v.sku}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* سمات المتغير */}
          {selectedVariant &&
            Object.keys(selectedVariant.attributes || {}).length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {Object.entries(selectedVariant.attributes).map(
                  ([key, val]) => (
                    <span
                      key={key}
                      className="rounded-md bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground"
                    >
                      <span className="me-1">{key}:</span>
                      <span className="font-medium text-foreground">{val}</span>
                    </span>
                  )
                )}
              </div>
            )}

          {/* حالة المخزون */}
          <div className="flex items-center gap-2 text-xs">
            {selectedVariant && !isOutOfStock ? (
              <span className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-500">
                <CheckIcon className="size-4" />
                متوفر في المخزون ({selectedVariant.stock_quantity} قطعة)
              </span>
            ) : (
              <span className="font-medium text-destructive">
                غير متوفر حالياً
              </span>
            )}
          </div>

          <Separator />

          {/* وصف المنتج */}
          {product.description && (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-foreground">
                تفاصيل المنتج
              </h2>
              <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                {product.description}
              </p>
            </div>
          )}

          {/* زر الشراء */}
          <div className="flex items-center gap-3 pt-4">
            <Button
              size="lg"
              className="flex-1 gap-2 text-sm font-semibold"
              disabled={!selectedVariant || isOutOfStock}
            >
              <ShoppingCartIcon className="size-4" />
              {isOutOfStock ? "نفذت الكمية" : "إضافة إلى السلة"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
