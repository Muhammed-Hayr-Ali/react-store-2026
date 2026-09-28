"use client"

import * as React from "react"
import {
  CheckIcon,
  ShoppingCartIcon,
  AlertCircleIcon,
  MinusIcon,
  PlusIcon,
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { ProductWithRelations } from "@/lib/actions/products/types"
import { CustomButton } from "@/components/ui/custom-button"

interface ProductDetailsProps {
  product: ProductWithRelations
}

// دالة مساعدة لتنسيق السعر (تحويل السنت إلى رقم عشري بدون رمز عملة)
const formatPrice = (priceInCents: number) => {
  return (priceInCents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

// خريطة ألوان احتياطية لأسماء الألوان
const COLOR_MAP: Record<string, string> = {
  red: "#ef4444",
  أحمر: "#ef4444",
  blue: "#3b82f6",
  أزرق: "#3b82f6",
  black: "#000000",
  أسود: "#000000",
  white: "#ffffff",
  أبيض: "#ffffff",
  green: "#22c55e",
  أخضر: "#22c55e",
  yellow: "#eab308",
  أصفر: "#eab308",
  orange: "#f97316",
  برتقالي: "#f97316",
}

// دالة ذكية لتحويل قيمة اللون إلى كود HEX
const getColorHex = (colorValue: string) => {
  const trimmedValue = colorValue.trim()
  if (trimmedValue.startsWith("#")) return trimmedValue
  if (/^[0-9A-Fa-f]{6}$/.test(trimmedValue)) return `#${trimmedValue}`
  const mappedColor = COLOR_MAP[trimmedValue.toLowerCase()]
  if (mappedColor) return mappedColor
  return trimmedValue
}

export default function ProductDetailsPage({ product }: ProductDetailsProps) {
  const availableVariants = product.product_variants.filter((v) => v.is_active)

  // 1. استخراج جميع السمات الفريدة المتاحة للمنتج
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

  // 2. حالة السمات المختارة حالياً
  const [selectedAttributes, setSelectedAttributes] = React.useState<
    Record<string, string>
  >({})

  // 3. اشتقاق المتغير المحدد بناءً على السمات المختارة
  const selectedVariant = React.useMemo(() => {
    if (Object.keys(selectedAttributes).length === 0) {
      return availableVariants[0] || null
    }
    return (
      availableVariants.find((v) => {
        if (!v.attributes) return false
        return Object.entries(selectedAttributes).every(
          ([key, value]) => v.attributes[key] === value
        )
      }) || null
    )
  }, [selectedAttributes, availableVariants])

  // 4. حالة الكمية المختارة
  const [quantity, setQuantity] = React.useState(1)

  // تحديد الصورة النشطة
  const defaultImageObj =
    product.product_images.find((img) => img.is_primary) ||
    product.product_images[0] ||
    null

  const [activeImage, setActiveImage] = React.useState<string>(
    defaultImageObj ? defaultImageObj.url : ""
  )

  // ✅ عند تغيير سمة، نحدث الصورة ونعيد تعيين الكمية مباشرة (بدون useEffect)
  const handleAttributeSelect = (key: string, value: string) => {
    const newAttributes = { ...selectedAttributes, [key]: value }
    setSelectedAttributes(newAttributes)
    setQuantity(1) // إعادة التعيين هنا مباشرة استجابةً لتفاعل المستخدم

    const matchingVariant = availableVariants.find(
      (v) => v.attributes && v.attributes[key] === value
    )

    if (matchingVariant) {
      const variantImg = product.product_images.find(
        (img) => img.variant_id === matchingVariant.id
      )
      setActiveImage(variantImg ? variantImg.url : defaultImageObj?.url || "")
    }
  }

  // دوال التحكم بالكمية
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return
    if (selectedVariant && newQuantity > selectedVariant.stock_quantity) return
    setQuantity(newQuantity)
  }

  const incrementQuantity = () => {
    handleQuantityChange(quantity + 1)
  }

  const decrementQuantity = () => {
    handleQuantityChange(quantity - 1)
  }

  // حساب نسبة الخصم
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

  // حساب السعر الإجمالي
  const totalPrice = selectedVariant ? selectedVariant.price * quantity : 0

  return (
    <div className="mx-auto w-full max-w-6xl py-12 md:py-20">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
        {/* --- Image Gallery Section --- */}
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
                <span>No image available</span>
              </div>
            )}

            {!isOutOfStock && discountPercentage && (
              <span className="text-destructive-foreground absolute end-4 top-4 rounded-full bg-destructive px-3 py-1 text-xs font-semibold shadow-sm">
                {discountPercentage}% OFF
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.product_images.length > 1 && (
            <div className="scrollbar-hide flex items-center gap-3 overflow-x-auto pb-2">
              {product.product_images.map((img) => {
                const isSelected = activeImage === img.url
                return (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setActiveImage(img.url)}
                    className={`relative size-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                      isSelected
                        ? "border-primary"
                        : "border-transparent opacity-60 hover:border-muted-foreground/30 hover:opacity-100"
                    }`}
                    aria-label={`View image ${img.alt_text || product.name}`}
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

        {/* --- Product Details & Options Section --- */}
        <div className="flex flex-col justify-center space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {product.category && (
                <span className="font-medium">{product.category.name}</span>
              )}
              {product.category && product.brand && <span>•</span>}
              {product.brand && (
                <span className="font-medium">{product.brand.name}</span>
              )}
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {product.name}
            </h1>

            {/* منطقة السعر */}
            <div className="flex min-h-[40px] items-baseline gap-3 pt-1">
              {!isOutOfStock && selectedVariant ? (
                <>
                  <span className="text-3xl font-extrabold text-primary">
                    {formatPrice(selectedVariant.price)}
                  </span>
                  {selectedVariant.compare_at_price &&
                    selectedVariant.compare_at_price >
                      selectedVariant.price && (
                      <span className="text-base text-muted-foreground line-through decoration-destructive/50">
                        {formatPrice(selectedVariant.compare_at_price)}
                      </span>
                    )}
                </>
              ) : (
                <span className="flex items-center gap-2 text-xl font-bold text-destructive">
                  <AlertCircleIcon className="size-5" />
                  Out of Stock
                </span>
              )}
            </div>
          </div>

          <Separator />

          {/* --- Smart Attributes Selection --- */}
          {Object.keys(attributeOptions).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(attributeOptions).map(([key, values]) => {
                const lowerKey = key.toLowerCase()
                const isColor =
                  lowerKey.includes("color") || lowerKey.includes("لون")

                return (
                  <div key={key} className="space-y-3">
                    <span className="text-sm font-semibold text-foreground capitalize">
                      {isColor
                        ? "Color"
                        : key.charAt(0).toUpperCase() + key.slice(1)}
                    </span>
                    <div className="flex flex-wrap gap-3">
                      {values.map((value) => {
                        const isDisabled = !availableVariants.some(
                          (v) =>
                            v.attributes &&
                            v.attributes[key] === value &&
                            v.stock_quantity > 0
                        )
                        const isSelected = selectedAttributes[key] === value

                        return (
                          <button
                            key={value}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => handleAttributeSelect(key, value)}
                            className={`relative transition-all duration-200 ${
                              isDisabled
                                ? "cursor-not-allowed opacity-40"
                                : "cursor-pointer"
                            }`}
                            title={value}
                          >
                            {isColor && (
                              <div
                                className={`flex size-8 items-center justify-center rounded-full border transition-all ${
                                  isSelected
                                    ? "border-primary ring-1 ring-primary"
                                    : "border-muted-foreground/20 hover:border-primary/50"
                                }`}
                                style={{ backgroundColor: getColorHex(value) }}
                              >
                                {isSelected && (
                                  <CheckIcon className="size-4 text-white" />
                                )}
                              </div>
                            )}

                            {!isColor && (
                              <div
                                className={`relative flex h-10 min-w-[3.5rem] items-center justify-center border px-3 text-sm font-bold transition-colors ${
                                  isSelected
                                    ? "border-primary text-primary"
                                    : "border-muted-foreground/20 text-foreground hover:border-primary/50"
                                } ${isDisabled ? "line-through opacity-40" : ""}`}
                              >
                                {value}
                                {isSelected && (
                                  <div
                                    className="absolute -inset-e-px -top-px size-2.5 bg-primary rtl:rotate-y-180"
                                    style={{
                                      clipPath:
                                        "polygon(100% 0, 0 0, 100% 100%)",
                                    }}
                                  />
                                )}
                              </div>
                            )}
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
              <div className="space-y-3">
                <span className="text-sm font-medium text-foreground">
                  Available Options
                </span>
                <div className="flex flex-wrap gap-2.5 pt-1">
                  {availableVariants.map((v) => {
                    const isCurrent = selectedVariant?.id === v.id
                    const isDisabled = v.stock_quantity === 0
                    return (
                      <button
                        key={v.id}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => {
                          setSelectedAttributes({})
                          setQuantity(1)
                        }}
                        className={`flex flex-col items-start border px-4 py-2.5 text-start text-xs transition-colors ${
                          isCurrent
                            ? "border-primary font-semibold text-primary"
                            : isDisabled
                              ? "cursor-not-allowed border-muted-foreground/20 text-muted-foreground line-through opacity-40"
                              : "border-muted-foreground/20 text-foreground hover:border-primary/50"
                        }`}
                      >
                        <span>{v.name || v.sku}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          )}

          <Separator />

          {/* Product Description */}
          {product.description && (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-foreground">
                Product Details
              </h2>
              <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                {product.description}
              </p>
            </div>
          )}

          {/* ✅ Quantity & Total Price (Unified Row) */}
          {!isOutOfStock && selectedVariant && (
            <div className="flex items-center justify-between gap-4 border-t border-border pt-4">
              {/* محدد الكمية - Quantity Selector */}
              <div
                dir="ltr"
                className="inline-flex items-center rounded-lg border border-border bg-muted/30 p-0.5"
              >
                <CustomButton
                  variant="ghost"
                  size="icon"
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  aria-label="تقليل الكمية"
                  className="size-8 rounded-md hover:bg-background disabled:opacity-40"
                >
                  <MinusIcon className="size-3.5" />
                </CustomButton>

                <input
                  type="number"
                  value={quantity}
                  onChange={(e) =>
                    handleQuantityChange(parseInt(e.target.value) || 1)
                  }
                  min={1}
                  max={selectedVariant.stock_quantity}
                  className="w-12 [appearance:textfield] bg-transparent text-center text-sm font-semibold tabular-nums focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  aria-label="الكمية"
                />

                <CustomButton
                  variant="ghost"
                  size="icon"
                  onClick={incrementQuantity}
                  disabled={quantity >= selectedVariant.stock_quantity}
                  aria-label="زيادة الكمية"
                  className="size-8 rounded-md hover:bg-background disabled:opacity-40"
                >
                  <PlusIcon className="size-3.5" />
                </CustomButton>
              </div>

              {/* السعر الإجمالي - Total Price */}
              <div className="text-end">
                <span className="block text-xs font-medium text-muted-foreground">
                  Total Price
                </span>
                <span className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  {formatPrice(totalPrice)}
                </span>
              </div>
            </div>
          )}

          {/* Add to Cart Button */}
          <div className="flex items-center gap-3 pt-2">
            <CustomButton
              className="w-full"
              disabled={!selectedVariant || isOutOfStock}
            >
              <ShoppingCartIcon className="size-5" />
              {isOutOfStock
                ? "Out of Stock"
                : quantity > 1
                  ? `Add ${quantity} to Cart`
                  : "Add to Cart"}
            </CustomButton>
          </div>
        </div>
      </div>
    </div>
  )
}
