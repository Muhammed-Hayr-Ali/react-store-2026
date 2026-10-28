/**
 * @file components/store/wishlist-button.tsx
 * @description Interactive wishlist toggle button with loading and active states.
 */

"use client"

import * as React from "react"
import { Heart, LoaderCircleIcon } from "lucide-react"
import { useWishlist } from "@/lib/context/wishlist-context"
import { cn } from "@/lib/utils" // دالة دمج الـ tailwind المعتمدة في مشروعك
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import { Can } from "@/components/shared/can"
import { PERMISSIONS } from "@/lib/actions/role"

interface WishlistButtonProps {
  productId: string
  className?: string
}

export function WishlistButton({ productId }: WishlistButtonProps) {
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
    <Can permission={PERMISSIONS.VIEW_USER_WISHLIST}>
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
    </Can>
  )
}
