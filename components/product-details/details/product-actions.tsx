/**
 * @file components/store/product-details/details/product-actions.tsx
 * @description Apple-inspired minimalist product action bar including wishlist and cart actions.
 */

"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { ShoppingCartIcon, PlusIcon, MinusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductVariantDetail } from "@/lib/actions/store/product-details/details/queries/get-product-details"
import { useCurrency } from "@/lib/context/currency-context"
import { WishlistButton } from "@/components/wishlist/wishlist-button"
import { useCart } from "@/lib/context/cart-context"

interface ProductActionsProps {
  productId: string
  variant: ProductVariantDetail
  isProductActive: boolean
}

export function ProductActions({
  productId,
  variant,
  isProductActive,
}: ProductActionsProps) {
  const t = useTranslations("ProductDetails")
  const { formatRawPrice, currentCurrency } = useCurrency()
  const { addItem, isPending } = useCart()

  const [quantity, setQuantity] = React.useState(1)

  const [prevVariantId, setPrevVariantId] = React.useState(variant.id)
  if (prevVariantId !== variant.id) {
    setPrevVariantId(variant.id)
    setQuantity(1)
  }

  const isOutOfStock = variant.track_inventory && variant.stock_quantity <= 0
  const isDisabled = !isProductActive || isOutOfStock

  const unitPriceInCents = variant.price || 0
  const totalPriceInCents = unitPriceInCents * (isOutOfStock ? 0 : quantity)

  const handleIncrement = () => {
    if (!variant.track_inventory || quantity < variant.stock_quantity) {
      setQuantity((prev) => prev + 1)
    }
  }

  const handleDecrement = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1))
  }

  const handleAddToCart = async () => {
    await addItem(productId, variant.id, quantity)
  }

  return (
    <div className="space-y-4 pt-2">
      {/* شريط موحد ونظيف تماماً بدون خلفيات ثقيلة */}
      <div
        className={`flex items-center justify-between py-2 ${isOutOfStock ? "opacity-50" : ""}`}
      >
        {/* محدد الكمية بنمط Minimalist */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-muted-foreground">
            {t("QUANTITY", { default: "Quantity" })}
          </span>
          <div className="flex items-center rounded-lg bg-muted/60 p-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleIncrement}
              disabled={
                isDisabled ||
                (variant.track_inventory && quantity >= variant.stock_quantity)
              }
              className="size-7 rounded-md text-muted-foreground hover:text-foreground"
              aria-label={t("INCREASE_QUANTITY", { default: "Increase" })}
            >
              <PlusIcon className="size-3" />
            </Button>{" "}
            <span className="w-8 text-center text-xs font-semibold text-foreground tabular-nums">
              {isOutOfStock ? 0 : quantity}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleDecrement}
              disabled={isDisabled || quantity <= 1}
              className="size-7 rounded-md text-muted-foreground hover:text-foreground"
              aria-label={t("DECREASE_QUANTITY", { default: "Decrease" })}
            >
              <MinusIcon className="size-3" />
            </Button>
          </div>
        </div>

        {/* عرض الإجمالي بتنسيق هادئ وخفيف */}
        <div className="flex items-center gap-3">
          <span className="me-1.5 text-xs font-medium text-muted-foreground">
            {t("TOTAL_PRICE", { default: "Total" })}:
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-foreground">
              {formatRawPrice(totalPriceInCents)}
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              {currentCurrency.symbol}
            </span>
          </div>
        </div>
      </div>

      {/* صف الأزرار: زر السلة وزر المفضلة بجانبه */}
      <div className="flex items-center gap-3">
        <Button
          type="button"
          size="lg"
          className="h-12 flex-1 gap-2 rounded-2xl text-sm font-medium transition-all active:scale-[0.99]"
          disabled={isDisabled || isPending}
          onClick={handleAddToCart}
        >
          <ShoppingCartIcon className="size-4" />
          {isOutOfStock
            ? t("OUT_OF_STOCK_BUTTON", { default: "Out of Stock" })
            : isPending
              ? t("ADDING_TO_CART", { default: "Adding..." })
              : quantity > 1
                ? t("ADD_MULTIPLE_TO_CART", {
                    count: quantity,
                    default: `Add ${quantity} to Bag`,
                  })
                : t("ADD_TO_CART", { default: "Add to Bag" })}
        </Button>

        {/* زر القلب للمفضلة بتصميم متناسق تماماً مع زر السلة */}
        <WishlistButton productId={productId} />
      </div>
    </div>
  )
}
