/**
 * @file lib/context/cart-context.tsx
 * @description Cart context returning action results and pending state with strict typing.
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
  AddToCartInput,
} from "@/lib/actions/cart"
import { ApiResult } from "../actions/types/utils"

interface CartContextType {
  cart: CartQueryResult | null
  addItem: (input: AddToCartInput) => Promise<ApiResult<boolean>>
  updateItemQuantity: (itemId: string, quantity: number) => Promise<ApiResult<boolean>>
  removeItem: (itemId: string) => Promise<ApiResult<boolean>>
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

  const refreshCart = async () => {
    const updatedCartResult = await getCart()
    if (updatedCartResult.success) {
      setCart(updatedCartResult.data)
    }
  }

  // إضافة منتج مع إرجاع الـ Result
  async function addItem(input: AddToCartInput): Promise<ApiResult<boolean>> {
    return new Promise((resolve) => {
      startTransition(async () => {
        const result = await addToCart({
          product_id: input.product_id,
          variant_id: input.variant_id,
          quantity: input.quantity,
        })

        if (!result.success) {
          if (result.error === "AUTH_REQUIRED") {
            toast.error(
              t("AUTH_REQUIRED_TITLE")
            )
          } else {
            toast.error(
              t("ADD_ERROR")
            )
          }
        } else {
          toast.success(t("ITEM_ADDED"))
          await refreshCart()
        }

        resolve(result)
      })
    })
  }

  // تحديث الكمية مع إرجاع الـ Result
  const updateItemQuantity = async (
    itemId: string,
    quantity: number
  ): Promise<ApiResult<boolean>> => {
    return new Promise((resolve) => {
      startTransition(async () => {
        const result = await updateCartItem({ item_id: itemId, quantity })

        if (!result.success) {
          if (result.error === "AUTH_REQUIRED") {
            toast.error(
              t("AUTH_REQUIRED_TITLE", { default: "Sign in required" })
            )
          } else {
            toast.error(
              t("UPDATE_ERROR", { default: "Failed to update quantity" })
            )
          }
        } else {
          await refreshCart()
        }

        resolve(result)
      })
    })
  }

  // حذف منتج مع إرجاع الـ Result
  const removeItem = async (itemId: string): Promise<ApiResult<boolean>> => {
    return new Promise((resolve) => {
      startTransition(async () => {
        const result = await removeCartItem({ item_id: itemId })
        
        if (!result.success) {
          if (result.error === "AUTH_REQUIRED") {
            toast.error(
              t("AUTH_REQUIRED_TITLE", { default: "Sign in required" })
            )
          } else {
            toast.error(t("REMOVE_ERROR", { default: "Failed to remove item" }))
          }
        } else {
          await refreshCart()
        }

        resolve(result)
      })
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