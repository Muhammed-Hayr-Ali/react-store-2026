"use client"

import * as React from "react"
import { MinusIcon, PlusIcon, ShoppingCartIcon } from "lucide-react"
import { CustomButton } from "@/components/ui/custom-button"

// ✅ استيراد دالة تنسيق السعر الجديدة ونوع العملة
import { formatPrice as formatCurrencyPrice } from "@/lib/actions/currency/utils"
import type { CurrencyCode } from "@/lib/actions/currency/types"

interface ProductActionsProps {
  quantity: number
  totalPriceInCents: number // ✅ تم تغيير الاسم من totalPrice
  currency: CurrencyCode // ✅ إضافة جديدة
  exchangeRate: number // ✅ إضافة جديدة
  isOutOfStock: boolean
  maxStock: number
  onQuantityChange: (qty: number) => void
  onAddToCart?: () => void
}

export function ProductActions({
  quantity,
  totalPriceInCents,
  currency,
  exchangeRate,
  isOutOfStock,
  maxStock,
  onQuantityChange,
  onAddToCart,
}: ProductActionsProps) {
  // ✅ حساب السعر الإجمالي بالعملة المختارة
  const formattedTotalPrice = formatCurrencyPrice(
    isOutOfStock ? 0 : totalPriceInCents,
    currency,
    exchangeRate
  )

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
              onClick={() => onQuantityChange(quantity - 1)}
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
              onClick={() => onQuantityChange(quantity + 1)}
              disabled={isOutOfStock || quantity >= maxStock}
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
          {/* ✅ عرض السعر الإجمالي بالعملة المختارة (بدون علامة $ ثابتة) */}
          <span className="text-lg font-bold tracking-tight text-foreground tabular-nums">
            {formattedTotalPrice}
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
