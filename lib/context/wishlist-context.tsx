/**
 * @file lib/context/wishlist-context.tsx
 * @description Wishlist context and provider for managing user wishlist IDs with lightning-fast optimistic updates and translations.
 */

"use client"

import * as React from "react"
import { useTransition } from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { addToWishlist, removeFromWishlist } from "@/lib/actions/wishlists"

interface WishlistContextType {
  wishlistIds: string[]
  isInWishlist: (productId: string) => boolean
  toggleWishlist: (productId: string) => Promise<void>
  isPending: boolean
}

const WishlistContext = React.createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({
  initialWishlistIds,
  children,
}: {
  initialWishlistIds: string[]
  children: React.ReactNode
}) {
  const t = useTranslations("Wishlist")
  const [wishlistIds, setWishlistIds] = React.useState<string[]>(initialWishlistIds)
  const [isPending, startTransition] = useTransition()

  // التحقق السريع هل المنتج موجود في المفضلة
  const isInWishlist = React.useCallback(
    (productId: string) => wishlistIds.includes(productId),
    [wishlistIds]
  )

  // تبديل حالة المنتج (إضافة / إزالة) مع تحديث فوري (Optimistic Updates)
  const toggleWishlist = async (productId: string) => {
    const exists = isInWishlist(productId)

    // التحديث الفوري للواجهة قبل انتظار السيرفر
    setWishlistIds((prev) =>
      exists ? prev.filter((id) => id !== productId) : [...prev, productId]
    )

    startTransition(async () => {
      let result
      if (exists) {
        result = await removeFromWishlist({ product_id: productId })
      } else {
        result = await addToWishlist({ product_id: productId })
      }

      // إذا حدث خطأ، نُعيد الحالة كما كانت لتجنب عدم التوافق وإظهار التوست
      if (!result.success) {
        setWishlistIds((prev) =>
          exists ? [...prev, productId] : prev.filter((id) => id !== productId)
        )

        if (result.error === "PERMISSION_DENIED") {
          toast.error(t("AUTH_REQUIRED_TITLE", { default: "Sign in required" }), {
            description: t("AUTH_REQUIRED_DESC", { default: "Please sign in to save items to your wishlist." }),
          })
        } else {
          toast.error(t("GENERAL_ERROR", { default: "Something went wrong, please try again." }))
        }
      }
    })
  }

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        isInWishlist,
        toggleWishlist,
        isPending,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = React.useContext(WishlistContext)
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider")
  }
  return context
}