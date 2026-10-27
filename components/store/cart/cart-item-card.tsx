"use client"

/**
 * @file components/store/cart/cart-item-card.tsx
 * @description Apple-inspired minimalist cart item card with exact price formatting matching ProductPriceStock.
 */

import * as React from "react"
import { MinusIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCurrency } from "@/lib/context/currency-context"

interface CartItemCardProps {
  item: {
    id: string
    quantity: number
    product_variants?: {
      price?: number | null
      sku?: string | null
    } | null
    products?: {
      name?: string | null
    } | null
    resolved_image_url?: string | null
  }
  isPending: boolean
  onUpdateQuantity: (id: string, newQuantity: number) => void
  onRemove: (id: string) => void
}

export function CartItemCard({
  item,
  isPending,
  onUpdateQuantity,
  onRemove,
}: CartItemCardProps) {
  const { formatRawPrice, currentCurrency } = useCurrency()

  const product = item.products
  const variant = item.product_variants
  const itemUnitPrice = variant?.price || 0
  const imageUrl = item.resolved_image_url

  return (
    <div className="group relative flex items-center gap-4 rounded-2xl bg-muted/40 p-3.5 transition-all duration-300 hover:bg-muted/60">
      {/* صورة المنتج / المتغير */}
      <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-background/80 shadow-xs">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product?.name || "Product"}
            className="size-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">
            No image
          </div>
        )}
      </div>

      {/* تفاصيل المنتج وأزرار التحكم */}
      <div className="flex flex-1 flex-col justify-between py-0.5">
        <div className="flex items-start justify-between gap-2">
          <h4 className="line-clamp-1 text-xs font-medium text-foreground sm:text-sm">
            {product?.name}
          </h4>
          
          <button
            type="button"
            disabled={isPending}
            onClick={() => onRemove(item.id)}
            className="text-muted-foreground/60 transition-colors hover:text-destructive"
            aria-label="Remove item"
          >
            <Trash2Icon className="size-3.5" />
          </button>
        </div>

        <div className="mt-1 flex items-center justify-between">
          {/* طريقة عرض السعر المطابقة لـ ProductPriceStock تماماً */}
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-semibold text-foreground">
              {formatRawPrice(itemUnitPrice)}
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              {currentCurrency.symbol}
            </span>
          </div>

          <div className="flex items-center rounded-full bg-background/80 border border-border/40 p-0.5 shadow-2xs">
            <Button
              variant="ghost"
              size="icon"
              className="size-6 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
              disabled={isPending || item.quantity <= 1}
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            >
              <MinusIcon className="size-2.5" />
            </Button>
            <span className="flex min-w-6 items-center justify-center text-[11px] font-medium text-foreground">
              {item.quantity}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="size-6 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
              disabled={isPending}
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            >
              <PlusIcon className="size-2.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}