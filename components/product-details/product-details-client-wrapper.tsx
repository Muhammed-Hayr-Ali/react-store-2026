"use client"

import {
  FullProductDetails,
  ProductVariantDetail,
} from "@/lib/actions/store/product-details/details/queries/get-product-details"
import { ProductReviewsResult } from "@/lib/actions/store/product-details/reviews/queries/get-product-reviews"
import { ProductBreadcrumb } from "./details/product-breadcrumb"
import { ProductInfoSection } from "./details/product-info-section"
import { ProductReviewsSection } from "./reviews/product-reviews-section"
import React from "react"
import { useTranslations } from "next-intl"
import { useCurrency } from "@/lib/context/currency-context"
import { useCart } from "@/lib/context/cart-context"
import { Button } from "../ui/button"
import {
  LoaderCircleIcon,
  MinusIcon,
  PlusIcon,
  ShoppingBagIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { STORE_CONTAINER } from "@/lib/config/app_config"

interface ProductDetailsClientWrapperProps {
  product: FullProductDetails
  reviewsData: ProductReviewsResult | null
}

export default function ProductDetailsClientWrapper({
  product,
  reviewsData,
}: ProductDetailsClientWrapperProps) {
  const t = useTranslations("ProductDetails")
  const { formatRawPrice, currentCurrency } = useCurrency()
  const { addItem, isPending } = useCart()
  const [quantity, setQuantity] = React.useState<number>(1)
  const [selectedVariant, setSelectedVariant] =
    React.useState<ProductVariantDetail>(product.product_variants[0])

  const isOutOfStock =
    selectedVariant.track_inventory && selectedVariant.stock_quantity <= 0
  const isDisabled = !product.is_active || isOutOfStock || isPending

  const unitPriceInCents = selectedVariant.price || 0
  const totalPriceInCents = unitPriceInCents * (isOutOfStock ? 0 : quantity)

  const handleIncrement = () => {
    if (
      !selectedVariant.track_inventory ||
      quantity < selectedVariant.stock_quantity
    ) {
      setQuantity((prev) => prev + 1)
    }
  }

  const handleDecrement = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1))
  }

  const handleAddToCart = async () => {
    await addItem({
      product_id: product.id,
      variant_id: selectedVariant.id,
      quantity: quantity,
    })
  }

  return (
    <main className={cn(STORE_CONTAINER, "flex flex-col py-8 space-y-8")}>
      {/* Simplified Header for Product Details */}
      <ProductBreadcrumb
        category={product.category}
        productName={product.name}
      />

      {/* Scrollable Content Container */}
      <ProductInfoSection
        product={product}
        onSelectVariants={setSelectedVariant}
      />
      {/* 3. دمج وإرسال بيانات التقييمات والمراجعات للمكون الرئيسي */}
      <ProductReviewsSection reviewsData={reviewsData} />

      {/* Sticky Bottom Cart Bar for mobile and quick purchase */}
      <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center border-t bg-[#fafafa] pt-6 pb-4 md:hidden dark:bg-[#000000]">
        <div className="flex items-center gap-3">
          {/* عداد الكمية المصغر
            <div className="flex h-9 items-center rounded-full border border-border/40 bg-muted/60 p-0.5">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleDecrement}
                disabled={isDisabled || quantity <= 1}
                className="size-7 rounded-full text-muted-foreground hover:text-foreground"
                aria-label={t("DECREASE_QUANTITY", { default: "Decrease" })}
              >
                <MinusIcon className="size-3" />
              </Button>

              <span className="w-6 text-center text-xs font-semibold text-foreground tabular-nums">
                {isOutOfStock ? 0 : quantity}
              </span>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleIncrement}
                disabled={
                  isDisabled ||
                  (selectedVariant.track_inventory &&
                    quantity >= selectedVariant.stock_quantity)
                }
                className="size-7 rounded-full text-muted-foreground hover:text-foreground"
                aria-label={t("INCREASE_QUANTITY", { default: "Increase" })}
              >
                <PlusIcon className="size-3" />
              </Button>
            </div> */}

          {/* السعر الإجمالي */}
          <div className="flex items-baseline gap-1">
            <span className="text-base font-bold text-foreground tabular-nums">
              {formatRawPrice(totalPriceInCents)}
            </span>
            <span className="text-[10px] font-medium text-muted-foreground">
              {currentCurrency.symbol}
            </span>
          </div>
        </div>

        <Button
          size="lg"
          onClick={handleAddToCart}
          disabled={isDisabled || isOutOfStock}
          className={cn(
            "h-12 rounded-lg px-6 text-lg font-semibold transition-all duration-300 active:scale-95",
            isPending && "px-4" // تقليص الحشو الجانبي بسلاسة إذا أردت تصغيره قليلاً فقط
          )}
        >
          {isPending ? (
            <LoaderCircleIcon className="size-5 animate-spin" />
          ) : (
            <>
              <ShoppingBagIcon className="me-2 size-5" />
              {t("ADD_TO_CART")}
            </>
          )}
        </Button>
      </div>
    </main>
  )
}
