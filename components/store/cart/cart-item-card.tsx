/**
 * @file components/store/cart/cart-item-card.tsx
 * @description Ultra-compact cart item card with minimal padding and line-clamp-2 description.
 */

"use client"

import * as React from "react"
import { MinusIcon, PlusIcon, Trash2Icon } from "lucide-react"
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
      description?: string | null
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
    <div className="group relative flex items-center gap-2.5 rounded-xl bg-card py-1.5 px-2 shadow-2xs border border-border/40 transition-all duration-300">
      {/* صورة المنتج - مصغرة جداً */}
      <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted shadow-2xs">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product?.name || "Product"}
            className="size-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[9px] text-muted-foreground">
            No image
          </div>
        )}
      </div>

      {/* تفاصيل المنتج وأزرار التحكم */}
      <div className="flex flex-1 flex-col justify-between py-0.5 space-y-1">
        {/* الصف العلوي: الاسم والسعر */}
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-foreground text-xs line-clamp-1">
            {product?.name}
          </h4>
          <div className="flex items-baseline gap-1 shrink-0 font-semibold text-foreground text-xs">
            <span>{formatRawPrice(itemUnitPrice)}</span>
            <span className="text-[10px] font-medium text-muted-foreground">
              {currentCurrency.symbol}
            </span>
          </div>
        </div>

        {/* وصف المنتج - على سطر ونصف تقريبا باستخدام line-clamp-2 مع ارتفاع سطر محكم */}
        {product?.description && (
          <p className="text-[10px] leading-snug text-muted-foreground line-clamp-2 mt-0.5">
            {product.description}
          </p>
        )}

        {/* الصف السفلي: أزرار التحكم بالكمية وزر الحذف */}
        <div className="mt-1.5 flex items-center justify-between">
          {/* أزرار الكمية المصغرة */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isPending || item.quantity <= 1}
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              className="flex size-5 items-center justify-center rounded-full bg-foreground text-background transition-transform active:scale-95 disabled:opacity-50"
              aria-label="Decrease quantity"
            >
              <MinusIcon className="size-3" />
            </button>
            <span className="min-w-3 text-center text-xs font-medium text-foreground">
              {item.quantity}
            </span>
            <button
              type="button"
              disabled={isPending}
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              className="flex size-5 items-center justify-center rounded-full bg-foreground text-background transition-transform active:scale-95 disabled:opacity-50"
              aria-label="Increase quantity"
            >
              <PlusIcon className="size-3" />
            </button>
          </div>

          {/* زر الحذف المصغر */}
          <button
            type="button"
            disabled={isPending}
            onClick={() => onRemove(item.id)}
            className="text-destructive transition-colors hover:opacity-80 p-0.5"
            aria-label="Remove item"
          >
            <Trash2Icon className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}