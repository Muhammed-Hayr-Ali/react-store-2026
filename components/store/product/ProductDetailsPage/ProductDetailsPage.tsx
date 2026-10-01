"use client"

import * as React from "react"
import {
  CheckIcon,
  ShoppingCartIcon,
  AlertCircleIcon,
  MinusIcon,
  PlusIcon,
  ShieldCheckIcon,
  TruckIcon,
  RotateCcwIcon,
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { ProductWithRelations } from "@/lib/actions/products/types"
import { CustomButton } from "@/components/ui/custom-button"

interface ProductDetailsProps {
  product: ProductWithRelations
}

type ProductVariantItem = ProductWithRelations["product_variants"][number]
type ProductImageItem = ProductWithRelations["product_images"][number] & {
  variant_sku?: string | null
}

const formatPrice = (priceInCents: number) => {
  return (priceInCents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const COLOR_MAP: Record<string, string> = {
  red: "#ef4444",
  أحمر: "#ef4444",
  blue: "#3b82f6",
  أزرق: "#3b82f6",
  black: "#171717",
  أسود: "#171717",
  white: "#ffffff",
  أبيض: "#ffffff",
  green: "#22c55e",
  أخضر: "#22c55e",
  yellow: "#eab308",
  أصفر: "#eab308",
  orange: "#f97316",
  برتقالي: "#f97316",
  gray: "#737373",
  رمادي: "#737373",
}

const getColorHex = (colorValue: string) => {
  const trimmed = colorValue.trim()
  if (trimmed.startsWith("#")) return trimmed
  if (/^[0-9A-Fa-f]{3,8}$/.test(trimmed)) return `#${trimmed}`
  const mapped = COLOR_MAP[trimmed.toLowerCase()]
  return mapped || trimmed
}

function resolveVariantImage(
  variant: ProductVariantItem | null,
  allVariants: ProductVariantItem[],
  allImages: ProductImageItem[]
): string {
  if (!variant || allImages.length === 0) return ""

  // 1. مطابقة مباشرة عبر variant_id
  const directMatch = allImages.find((img) => img.variant_id === variant.id)
  if (directMatch?.url) return directMatch.url

  // 2. مطابقة عبر variant_sku
  const skuMatch = allImages.find(
    (img) =>
      img.variant_sku &&
      variant.sku &&
      img.variant_sku.trim().toLowerCase() === variant.sku.trim().toLowerCase()
  )
  if (skuMatch?.url) return skuMatch.url

  // 3. Fallback ذكي للون
  const currentColor =
    variant.attributes?.color ||
    variant.attributes?.colour ||
    variant.attributes?.["اللون"]

  if (currentColor) {
    const siblingWithSameColor = allVariants.find(
      (v) =>
        v.id !== variant.id &&
        (v.attributes?.color === currentColor ||
          v.attributes?.colour === currentColor ||
          v.attributes?.["اللون"] === currentColor) &&
        allImages.some((img) => img.variant_id === v.id)
    )

    if (siblingWithSameColor) {
      const siblingImage = allImages.find(
        (img) => img.variant_id === siblingWithSameColor.id
      )
      if (siblingImage?.url) return siblingImage.url
    }
  }

  // 4. استخدام الصورة الأساسية للمنتج أو أول صورة متاحة
  const primaryImg = allImages.find((img) => img.is_primary)
  return primaryImg?.url || allImages[0]?.url || ""
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

  // ✅ صورة اختارها العميل يدوياً من شريط المصغرات (إن وجدت)
  const [userSelectedImage, setUserSelectedImage] = React.useState<
    string | null
  >(null)

  // ✅ حساب الصورة النشطة كقيمة مشتقة بدون أي useEffect أو تحذيرات
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

    // إعادة ضبط الكمية والصورة المختارة يدوياً لتتبع المتغير الجديد تلقائياً
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
  const isLowStock =
    selectedVariant &&
    selectedVariant.stock_quantity > 0 &&
    selectedVariant.stock_quantity <= (selectedVariant.low_stock_threshold || 5)

  const discountPercentage =
    selectedVariant?.compare_at_price &&
    selectedVariant.compare_at_price > selectedVariant.price
      ? Math.round(
          ((selectedVariant.compare_at_price - selectedVariant.price) /
            selectedVariant.compare_at_price) *
            100
        )
      : null

  const totalPrice = selectedVariant ? selectedVariant.price * quantity : 0

  return (
    <section className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-14">
      {/* المعرض المرئي */}
      <div className="space-y-4 lg:col-span-6">
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border/60 bg-muted/20">
          {activeImage ? (
            <img
              src={activeImage}
              alt={product.name}
              className="size-full object-cover transition-all duration-300"
            />
          ) : (
            <div className="flex size-full flex-col items-center justify-center text-sm text-muted-foreground">
              <AlertCircleIcon className="mb-2 size-8 opacity-40" />
              <span>No image available</span>
            </div>
          )}

          {!isOutOfStock && discountPercentage && (
            <span className="text-destructive-foreground absolute start-4 top-4 rounded-full bg-destructive px-3 py-1 text-xs font-semibold shadow-xs">
              {discountPercentage}% OFF
            </span>
          )}
        </div>

        {/* الصور المصغرة */}
        {productImages.length > 1 && (
          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            {productImages.map((img) => {
              const isSelected = activeImage === img.url
              return (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => handleThumbnailClick(img)}
                  className={`relative size-18 shrink-0 overflow-hidden rounded-xl border bg-background transition-all ${
                    isSelected
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-border/70 opacity-60 hover:border-foreground/30 hover:opacity-100"
                  }`}
                  aria-label="Select product image"
                >
                  <img
                    src={img.url}
                    alt={img.alt_text || product.name}
                    className="size-full object-cover"
                  />
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* تفاصيل المنتج وخيارات الشراء */}
      <div className="space-y-6 lg:col-span-6">
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
            {product.category && (
              <span className="rounded-md bg-muted px-2 py-0.5 text-foreground">
                {product.category.name}
              </span>
            )}
            {product.brand && (
              <>
                <span>•</span>
                <span>{product.brand.name}</span>
              </>
            )}
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {product.name}
          </h1>

          {/* منطقة السعر والحالة */}
          <div className="flex h-11 items-center justify-between">
            <div className="flex items-center gap-3">
              {isOutOfStock ? (
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircleIcon className="size-6 shrink-0" />
                  <span className="text-2xl leading-none font-extrabold tracking-tight sm:text-3xl">
                    Out of Stock
                  </span>
                </div>
              ) : (
                <>
                  <span className="text-2xl leading-none font-extrabold tracking-tight text-foreground tabular-nums sm:text-3xl">
                    ${formatPrice(selectedVariant?.price ?? 0)}
                  </span>
                  {selectedVariant?.compare_at_price &&
                    selectedVariant.compare_at_price >
                      selectedVariant.price && (
                      <span className="text-base leading-none text-muted-foreground tabular-nums line-through">
                        ${formatPrice(selectedVariant.compare_at_price)}
                      </span>
                    )}
                </>
              )}
            </div>

            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                isOutOfStock
                  ? "bg-destructive/10 text-destructive"
                  : isLowStock
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              }`}
            >
              <span
                className={`size-1.5 rounded-full ${
                  isOutOfStock
                    ? "bg-destructive"
                    : isLowStock
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                }`}
              />
              {isOutOfStock
                ? "Unavailable"
                : isLowStock
                  ? `Only ${selectedVariant?.stock_quantity} left`
                  : "In Stock"}
            </span>
          </div>
        </div>

        <Separator />

        {/* خيارات المتغيرات */}
        {Object.keys(attributeOptions).length > 0 ? (
          <div className="space-y-5">
            {Object.entries(attributeOptions).map(([key, values]) => {
              const lowerKey = key.toLowerCase()
              const isColor =
                lowerKey.includes("color") || lowerKey.includes("لون")

              return (
                <div key={key} className="space-y-2.5">
                  <div className="text-xs">
                    <span className="font-semibold text-foreground capitalize">
                      {isColor ? "Color" : key}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    {values.map((value) => {
                      const isSelected = selectedAttributes[key] === value

                      if (isColor) {
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => handleAttributeSelect(key, value)}
                            className={`group relative flex size-9 items-center justify-center rounded-full border transition-all ${
                              isSelected
                                ? "border-primary"
                                : "border-border/60 hover:scale-105"
                            } cursor-pointer`}
                            title={value}
                            aria-label={`Select color ${value}`}
                          >
                            <span
                              className="size-7 rounded-full shadow-inner"
                              style={{ backgroundColor: getColorHex(value) }}
                            />
                            {isSelected && (
                              <CheckIcon
                                className={`size-3.5 ${
                                  getColorHex(value).toLowerCase() === "#ffffff"
                                    ? "text-black"
                                    : "text-white"
                                } absolute`}
                              />
                            )}
                          </button>
                        )
                      }

                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => handleAttributeSelect(key, value)}
                          className={`flex h-9 min-w-12 items-center justify-center rounded-lg border px-3 text-xs font-medium transition-all ${
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground shadow-xs"
                              : "border-border bg-card text-foreground hover:bg-muted"
                          } cursor-pointer`}
                        >
                          {value}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          availableVariants.length > 0 && (
            <div className="space-y-2.5">
              <span className="text-xs font-semibold text-foreground">
                Options
              </span>
              <div className="flex flex-wrap gap-2">
                {availableVariants.map((v) => {
                  const isCurrent = selectedVariant?.id === v.id
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => {
                        setSelectedVariantId(v.id)
                        setSelectedAttributes(v.attributes || {})
                        setUserSelectedImage(null)
                        setQuantity(1)
                      }}
                      className={`rounded-lg border px-3.5 py-2 text-xs font-medium transition-all ${
                        isCurrent
                          ? "border-primary bg-primary text-primary-foreground shadow-xs"
                          : "border-border bg-card text-foreground hover:bg-muted"
                      }`}
                    >
                      {v.name || v.sku}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        )}

        <Separator />

        {/* عناصر الكمية والإضافة للسلة */}
        <div className="space-y-4">
          <div
            className={`flex items-center justify-between rounded-xl border border-border/70 bg-muted/15 p-3 transition-opacity ${
              isOutOfStock ? "opacity-50" : "opacity-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                Quantity:
              </span>
              <div className="inline-flex items-center rounded-lg border bg-background p-0.5 shadow-xs">
                <CustomButton
                  variant="ghost"
                  size="icon"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="size-7 rounded-md disabled:pointer-events-none disabled:opacity-40"
                  aria-label="Decrease quantity"
                >
                  <MinusIcon className="size-3.5" />
                </CustomButton>

                <span className="w-10 text-center text-xs font-semibold text-foreground tabular-nums">
                  {isOutOfStock ? 0 : quantity}
                </span>

                <CustomButton
                  variant="ghost"
                  size="icon"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={
                    isOutOfStock ||
                    (selectedVariant
                      ? quantity >= selectedVariant.stock_quantity
                      : true)
                  }
                  className="size-7 rounded-md disabled:pointer-events-none disabled:opacity-40"
                  aria-label="Increase quantity"
                >
                  <PlusIcon className="size-3.5" />
                </CustomButton>
              </div>
            </div>

            <div className="text-end">
              <span className="block text-[11px] font-medium text-muted-foreground">
                Total Price
              </span>
              <span className="text-lg font-bold tracking-tight text-foreground tabular-nums">
                ${formatPrice(isOutOfStock ? 0 : totalPrice)}
              </span>
            </div>
          </div>

          <CustomButton
            className="h-11 w-full text-sm font-semibold shadow-xs"
            disabled={isOutOfStock}
          >
            <ShoppingCartIcon className="me-2 size-4" />
            {isOutOfStock
              ? "Out of Stock"
              : quantity > 1
                ? `Add ${quantity} to Cart`
                : "Add to Cart"}
          </CustomButton>
        </div>

        {/* شارات الميزات */}
        <div className="grid grid-cols-3 gap-2 border-t border-border/60 pt-4 text-center text-[11px] text-muted-foreground">
          <div className="flex flex-col items-center gap-1">
            <TruckIcon className="size-4 text-foreground/70" />
            <span>Fast Dispatch</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <RotateCcwIcon className="size-4 text-foreground/70" />
            <span>Easy Returns</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <ShieldCheckIcon className="size-4 text-foreground/70" />
            <span>Secure Checkout</span>
          </div>
        </div>

        {/* وصف المنتج */}
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
