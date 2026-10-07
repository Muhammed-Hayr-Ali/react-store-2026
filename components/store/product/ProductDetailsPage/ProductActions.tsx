"use client"

import * as React from "react"
import { MinusIcon, PlusIcon, ShoppingCartIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCurrency } from "@/lib/context/currency-context"

interface ProductActionsProps {
  quantity: number
  totalPriceInCents: number
  isOutOfStock: boolean
  maxStock: number
  onQuantityChange: (qty: number) => void
  onAddToCart?: () => void
}

export function ProductActions({
  quantity,
  totalPriceInCents,
  isOutOfStock,
  maxStock,
  onQuantityChange,
  onAddToCart,
}: ProductActionsProps) {
  const { format } = useCurrency()

  const formattedTotalPrice = format(isOutOfStock ? 0 : totalPriceInCents)

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
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onQuantityChange(quantity + 1)}
              disabled={isOutOfStock || quantity >= maxStock}
              className="size-7 rounded-md disabled:pointer-events-none disabled:opacity-40"
              aria-label="Increase quantity"
            >
              <PlusIcon className="size-3.5" />
            </Button>
            <span className="w-10 text-center text-xs font-semibold text-foreground tabular-nums">
              {isOutOfStock ? 0 : quantity}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onQuantityChange(quantity - 1)}
              disabled={quantity <= 1 || isOutOfStock}
              className="size-7 rounded-md disabled:pointer-events-none disabled:opacity-40"
              aria-label="Decrease quantity"
            >
              <MinusIcon className="size-3.5" />
            </Button>
          </div>
        </div>

        <div className="text-end">
          <span className="block text-[11px] font-medium text-muted-foreground">
            Total Price
          </span>
          <span className="text-lg font-bold tracking-tight text-foreground tabular-nums">
            {formattedTotalPrice}
          </span>
        </div>
      </div>

      <Button
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
      </Button>
    </div>
  )
}
