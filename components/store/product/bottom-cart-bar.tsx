/**
 * @file components/store/product/bottom-cart-bar.tsx
 * @description Simplified bottom cart bar container.
 */

import * as React from "react"

interface BottomCartBarProps {
  price?: number
}

export function BottomCartBar({ price = 0 }: BottomCartBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-4">
      <div className="flex items-center justify-between">
        <div>
          <span>Price: {price}</span>
        </div>
        <button type="button">
          Add to Cart
        </button>
      </div>
    </div>
  )
}