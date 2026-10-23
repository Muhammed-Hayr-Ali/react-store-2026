/**
 * @file components/store/wishlist/wishlist-header-button.tsx
 * @description Wishlist header button linked to the wishlist route with optional counter badge.
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { HeartIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWishlist } from "@/lib/context/wishlist-context"
import { appRoutes } from "@/lib/config/app-routes"
import { useLocale } from "next-intl"

export function WishlistHeaderButton() {
  const locale = useLocale()
  const { wishlistIds } = useWishlist()
  const count = wishlistIds.length

  return (
    <Button
      asChild
      variant="secondary"
      size="icon"
      aria-label="Wishlist"
      className="relative"
    >
      <Link href={`/${locale}${appRoutes.wishlist}`}>
        <HeartIcon className="size-4" />
        {count > 0 && (
          <span className="absolute -inset-e-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </Link>
    </Button>
  )
}
