/**
 * @file lib/context/cart-context.tsx
 * @description Cart context for state management, adding, updating, and removing items.
 */

"use client"

import * as React from "react"
import { useTransition } from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import {
  addToCart,
  updateCartItem,
  removeCartItem,
  getCart,
  type CartQueryResult,
} from "@/lib/actions/cart"

interface CartContextType {
  cart: CartQueryResult | null
  addItem: (
    productId: string,
    variantId: string,
    quantity?: number
  ) => Promise<void>
  updateItemQuantity: (itemId: string, quantity: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  isPending: boolean
  totalItemsCount: number
}

const CartContext = React.createContext<CartContextType | undefined>(undefined)

export function CartProvider({
  initialCart,
  children,
}: {
  initialCart: CartQueryResult | null
  children: React.ReactNode
}) {
  const t = useTranslations("Cart")
  const [cart, setCart] = React.useState<CartQueryResult | null>(initialCart)
  const [isPending, startTransition] = useTransition()

  const totalItemsCount = React.useMemo(() => {
    if (!cart?.items) return 0
    return cart.items.reduce((acc, item) => acc + Number(item.quantity), 0)
  }, [cart])

  // دالة تحديث الحالة من السيرفر
  const refreshCart = async () => {
    const updatedCartResult = await getCart()
    if (updatedCartResult.success) {
      setCart(updatedCartResult.data)
    }
  }

  const addItem = async (
    productId: string,
    variantId: string,
    quantity = 1
  ) => {
    startTransition(async () => {
      const result = await addToCart({
        product_id: productId,
        variant_id: variantId,
        quantity,
      })
      if (!result.success) {
        if (result.error === "AUTH_REQUIRED") {
          toast.error(
            t("AUTH_REQUIRED_TITLE", {
              default: "AUTH_REQUIRED_DESC",
            })
          )
        } else {
          toast.error(
            t("GENERAL_ERROR", {
              default: "Failed to add item",
            })
          )
        }
      } else {
        toast.success(
          t("ITEM_ADDED", { default: "Added to cart successfully" })
        )
        await refreshCart()
      }
    })
  }

  const updateItemQuantity = async (itemId: string, quantity: number) => {
    startTransition(async () => {
      const result = await updateCartItem({ item_id: itemId, quantity })
      if (!result.success) {
        if (result.error === "AUTH_REQUIRED") {
          toast.error(
            t("AUTH_REQUIRED_TITLE", {
              default: "AUTH_REQUIRED_DESC",
            })
          )
        } else {
          toast.error(
            t("UPDATE_ERROR", { default: "Failed to update quantity" })
          )
        }
      } else {
        toast.success(t("ITEM_UPDATED", { default: "Cart updated" }))
        await refreshCart()
      }
    })
  }

  const removeItem = async (itemId: string) => {
    startTransition(async () => {
      const result = await removeCartItem({ item_id: itemId })
      if (!result.success) {
        if (result.error === "AUTH_REQUIRED") {
          toast.error(
            t("AUTH_REQUIRED_TITLE", {
              default: "AUTH_REQUIRED_DESC",
            })
          )
        } else {
          toast.error(t("REMOVE_ERROR", { default: "Failed to remove item" }))
        }
      } else {
        toast.success(t("ITEM_REMOVED", { default: "Item removed from cart" }))
        await refreshCart()
      }
    })
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addItem,
        updateItemQuantity,
        removeItem,
        isPending,
        totalItemsCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = React.useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
