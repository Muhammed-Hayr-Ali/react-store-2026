"use client"

/**
 * @file components/store/product/product-navbar.tsx
 * @description Simplified product navigation bar container.
 */

import { useWishlist } from "@/lib/context/wishlist-context"
import { useTranslations } from "next-intl"
import * as React from "react"
import { toast } from "sonner"
import { Button } from "../ui/button"
import { Heart, LoaderCircleIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProductNavbarProps {
  productId: string
  productName?: string
}

export function ProductNavbar({ productId, productName }: ProductNavbarProps) {
  return (
    <header className="flex h-16 w-full items-center justify-between border-b px-4">
      <div>Back</div>
      <h1 className="font-medium">{productName}</h1>
      <WishlistButton productId={productId} />
    </header>
  )
}

function WishlistButton({ productId }: ProductNavbarProps) {
  const t = useTranslations("Wishlist")
  const { isInWishlist, toggleWishlist } = useWishlist()
  const active = isInWishlist(productId)
  const [isLoading, setIsLoading] = React.useState<boolean>(false)

  const handlToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      setIsLoading(true)
      const result = await toggleWishlist(productId)

      if (!result.success) {
        if (result.error === "AUTH_REQUIRED") {
          toast(t("AUTH_REQUIRED_TITLE"))
        } else {
          toast(t("GENERAL_ERROR"))
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      size="icon-lg"
      variant="outline"
      type="button"
      disabled={isLoading}
      onClick={handlToggleWishlist}
      aria-label={active ? "remove from wishlist" : "add to wishlist"}
      className="size-12 rounded-2xl"
    >
      {isLoading ? (
        <LoaderCircleIcon className="size-5 animate-spin" />
      ) : (
        <Heart
          className={cn(
            "size-5 transition-transform duration-200 active:scale-90",
            active && "scale-105 fill-current text-destructive"
          )}
        />
      )}
    </Button>
  )
}
