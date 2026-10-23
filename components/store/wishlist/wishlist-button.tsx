/**
 * @file components/store/wishlist-button.tsx
 * @description Interactive wishlist toggle button with loading and active states.
 */

"use client"

import * as React from "react"
import { Heart } from "lucide-react"
import { useWishlist } from "@/lib/context/wishlist-context"
import { cn } from "@/lib/utils" // دالة دمج الـ tailwind المعتمدة في مشروعك
import { Button } from "@/components/ui/button"

interface WishlistButtonProps {
  productId: string
  className?: string
}

export function WishlistButton({ productId }: WishlistButtonProps) {
  const { isInWishlist, toggleWishlist, isPending } = useWishlist()
  const active = isInWishlist(productId)

  return (
    <Button
      size="icon-lg"
      variant="outline"
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleWishlist(productId)
      }}
      disabled={isPending}
      aria-label={active ? "remove from wishlist" : "add to wishlist"}
      className="size-12 rounded-2xl"
    >
      <Heart
        className={cn(
          "size-5 transition-transform duration-200 active:scale-90",
          active && "scale-105 fill-current text-destructive"
        )}
      />
    </Button>
  )
}
