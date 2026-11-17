/**
 * @file components/store/product/bottom-cart-bar.tsx
 * @description Simplified bottom cart bar container.
 */

"use client"

import { useCart } from "@/lib/context/cart-context"

interface BottomCartBarProps {
  product_id: string
  variant_id: string
  quantity: number
}

export function BottomCartBar({
  product_id,
  variant_id,
  quantity,
}: BottomCartBarProps) {
  const { addItem } = useCart()

  return (
    <div className="fixed right-0 bottom-0 left-0 border-t bg-background p-4">
      <div className="flex items-center justify-between">
        <div>
          <span></span>
        </div>
        <button type="button">Add to Cart</button>
      </div>
    </div>
  )
}
