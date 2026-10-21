"use client"

/**
 * @file components/store/product-details/details/product-actions.tsx
 * @description Product action bar featuring quantity selector and add-to-cart button.
 */

import * as React from "react"
import { useTranslations } from "next-intl"
import { ShoppingCartIcon, PlusIcon, MinusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductVariantDetail } from "@/lib/actions/store/product-details/details/queries/get-product-details"

interface ProductActionsProps {
  variant: ProductVariantDetail
  isProductActive: boolean
}

export function ProductActions({ variant, isProductActive }: ProductActionsProps) {
  const t = useTranslations("ProductDetails")
  const [quantity, setQuantity] = React.useState(1)
  const [isAdding, setIsAdding] = React.useState(false)

  // تتبع الـ variant السابق بالطريقة الموصى بها من React لتصفير الكمية عند تغييره دون useEffect
  const [prevVariantId, setPrevVariantId] = React.useState(variant.id)
  if (prevVariantId !== variant.id) {
    setPrevVariantId(variant.id)
    setQuantity(1)
  }

  const isOutOfStock = variant.track_inventory && variant.stock_quantity <= 0
  const isDisabled = !isProductActive || isOutOfStock

  // حساب السعر الإجمالي مباشرة
  const unitPrice = variant.price || 0
  const totalPrice = unitPrice * (isOutOfStock ? 0 : quantity)

  const handleIncrement = () => {
    if (!variant.track_inventory || quantity < variant.stock_quantity) {
      setQuantity((prev) => prev + 1)
    }
  }

  const handleDecrement = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1))
  }

  const handleAddToCart = async () => {
    setIsAdding(true)
    // TODO: ربطها مع سلة التسوق (Cart Store / Server Action)
    setTimeout(() => {
      setIsAdding(false)
    }, 600)
  }

  return (
    <div className="space-y-4 pt-4 border-t border-border">
      {/* صندوق عرض الكمية وإجمالي السعر */}
      <div
        className={`flex items-center justify-between rounded-2xl border border-border/70 bg-muted/15 p-3.5 transition-opacity ${
          isOutOfStock ? "opacity-50" : "opacity-100"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-medium text-muted-foreground">
            {t("QUANTITY", { default: "Quantity:" })}
          </span>
          <div className="inline-flex items-center rounded-xl border bg-background p-0.5 shadow-xs">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleDecrement}
              disabled={isDisabled || quantity <= 1}
              className="size-8 rounded-lg disabled:pointer-events-none disabled:opacity-40"
              aria-label={t("DECREASE_QUANTITY", { default: "Decrease quantity" })}
            >
              <MinusIcon className="size-3.5" />
            </Button>
            <span className="w-10 text-center text-xs font-semibold text-foreground tabular-nums">
              {isOutOfStock ? 0 : quantity}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleIncrement}
              disabled={isDisabled || (variant.track_inventory && quantity >= variant.stock_quantity)}
              className="size-8 rounded-lg disabled:pointer-events-none disabled:opacity-40"
              aria-label={t("INCREASE_QUANTITY", { default: "Increase quantity" })}
            >
              <PlusIcon className="size-3.5" />
            </Button>
          </div>
        </div>

        <div className="text-end">
          <span className="block text-[11px] font-medium text-muted-foreground">
            {t("TOTAL_PRICE", { default: "Total Price" })}
          </span>
          <span className="text-base font-bold tracking-tight text-foreground tabular-nums">
            {totalPrice.toFixed(2)}
          </span>
        </div>
      </div>

      {/* زر إضافة إلى السلة */}
      <Button
        type="button"
        size="lg"
        className="h-12 w-full gap-2 text-sm font-semibold shadow-sm"
        disabled={isDisabled || isAdding}
        onClick={handleAddToCart}
      >
        <ShoppingCartIcon className="size-4" />
        {isOutOfStock
          ? t("OUT_OF_STOCK_BUTTON", { default: "Out of Stock" })
          : isAdding
          ? t("ADDING_TO_CART", { default: "Adding..." })
          : quantity > 1
          ? t("ADD_MULTIPLE_TO_CART", { count: quantity, default: `Add ${quantity} to Cart` })
          : t("ADD_TO_CART", { default: "Add to Cart" })}
      </Button>
    </div>
  )
}