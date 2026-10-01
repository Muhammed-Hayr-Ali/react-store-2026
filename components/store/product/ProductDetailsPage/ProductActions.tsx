"use client"

import * as React from "react"
import { MinusIcon, PlusIcon, ShoppingCartIcon } from "lucide-react"
import { CustomButton } from "@/components/ui/custom-button"
import { formatPrice } from "./utils"

interface ProductActionsProps {
  quantity: number
  totalPrice: number
  isOutOfStock: boolean
  maxStock: number
  onQuantityChange: (qty: number) => void
  onAddToCart?: () => void
}

export function ProductActions({
  quantity,
  totalPrice,
  isOutOfStock,
  maxStock,
  onQuantityChange,
  onAddToCart,
}: ProductActionsProps) {
  return (
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
              onClick={() => onQuantityChange(quantity + 1)}
              disabled={isOutOfStock || quantity >= maxStock}
              className="size-7 rounded-md disabled:pointer-events-none disabled:opacity-40"
              aria-label="Increase quantity"
            >
              <PlusIcon className="size-3.5" />
            </CustomButton>
            <span className="w-10 text-center text-xs font-semibold text-foreground tabular-nums">
              {isOutOfStock ? 0 : quantity}
            </span>
            <CustomButton
              variant="ghost"
              size="icon"
              onClick={() => onQuantityChange(quantity - 1)}
              disabled={quantity <= 1 || isOutOfStock}
              className="size-7 rounded-md disabled:pointer-events-none disabled:opacity-40"
              aria-label="Decrease quantity"
            >
              <MinusIcon className="size-3.5" />
            </CustomButton>
          </div>
        </div>

        <div className="text-end">
          <span className="block text-[11px] font-medium text-muted-foreground">
            Total Price
          </span>
          <span className="text-lg font-medium text-foreground tabular-nums">
            {formatPrice(isOutOfStock ? 0 : totalPrice)}
          </span>
        </div>
      </div>

      <CustomButton
        className="h-11 w-full text-sm font-semibold shadow-xs"
        disabled={isOutOfStock}
        onClick={onAddToCart}
      >
        <ShoppingCartIcon className="me-2 size-4" />
        {isOutOfStock
          ? "Out of Stock"
          : quantity > 1
            ? `Add ${quantity} to Cart`
            : "Add to Cart"}
      </CustomButton>
    </div>
  )
}
