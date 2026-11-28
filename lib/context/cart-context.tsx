"use client"

/**
 * @file lib/context/cart-context.tsx
 * @description Cart context returning action results and pending state with strict typing.
 */

import * as React from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import {
  addToCart,
  updateCartItem,
  removeCartItem,
  getCart,
  type CartQueryResult,
  type AddToCartInput,
} from "@/lib/actions/cart"
import type { ApiResult } from "../actions/types/utils"

interface CartContextType {
  /** السلة الحالية مع عناصرها، أو `null` إذا لم تتوفر. */
  cart: CartQueryResult | null
  /**
   * يضيف متغير منتج إلى السلة، ويعرض إشعار النجاح أو الفشل، ثم يحدث السلة.
   *
   * @param input - `product_id` و`variant_id` و`quantity`.
   * @returns نتيجة العملية. **لا يرمي خطأ**؛ افحص `success`.
   */
  addItem: (input: AddToCartInput) => Promise<ApiResult<boolean>>
  /**
   * يحدد الكمية الجديدة لعنصر في السلة (قيمة نهائية وليست مقدار الزيادة)، ثم يحدث السلة.
   * يعرض إشعاراً عند الفشل.
   * لأزرار `+` و`−` استخدم `useDebouncedCartQuantity` لتقليل الطلبات.
   *
   * @param itemId - معرف عنصر السلة (`cart_items.id`) وليس معرف المنتج.
   * @param quantity - الكمية الجديدة.
   * @returns نتيجة العملية، وتصل بعد تحديث السلة. **لا يرمي خطأ**.
   */
  updateItemQuantity: (
    itemId: string,
    quantity: number
  ) => Promise<ApiResult<boolean>>
  /**
   * يحذف عنصراً من السلة ثم يحدثها. يعرض إشعاراً عند الفشل.
   *
   * @param itemId - معرف عنصر السلة (`cart_items.id`).
   * @returns نتيجة العملية. **لا يرمي خطأ**.
   */
  removeItem: (itemId: string) => Promise<ApiResult<boolean>>
  /** `true` ما دامت إحدى عمليات السلة قيد التنفيذ. */
  isPending: boolean
  /** مجموع كميات كل العناصر (وليس عدد الأسطر). مناسب لشارة السلة. */
  totalItemsCount: number
}

type CartErrorKey = "ADD_ERROR" | "UPDATE_ERROR" | "REMOVE_ERROR"

const CartContext = React.createContext<CartContextType | undefined>(undefined)

/**
 * يوفر بيانات السلة وعملياتها لكل المكونات الفرعية.
 * تتم مزامنة السلة تلقائياً عند وصول `initialCart` جديدة من الخادم
 * (بعد تسجيل الدخول أو الخروج و`router.refresh()`).
 */
export function CartProvider({
  initialCart,
  children,
}: {
  initialCart: CartQueryResult | null
  children: React.ReactNode
}) {
  const t = useTranslations("Cart")
  const [cart, setCart] = React.useState<CartQueryResult | null>(initialCart)
  const [isPending, startTransition] = React.useTransition()

  // دون هذه المزامنة تبقى سلة المستخدم السابق ظاهرة بعد تسجيل الخروج
  const [prevInitialCart, setPrevInitialCart] = React.useState(initialCart)
  if (prevInitialCart !== initialCart) {
    setPrevInitialCart(initialCart)
    setCart(initialCart)
  }

  // رقم متسلسل حتى لا يكتب رد قديم فوق رد أحدث
  const refreshIdRef = React.useRef(0)

  const refreshCart = React.useCallback(async () => {
    const refreshId = ++refreshIdRef.current
    try {
      const result = await getCart()
      if (result.success && refreshId === refreshIdRef.current) {
        setCart(result.data)
      }
    } catch (error) {
      // العملية نفسها نجحت؛ فشل التحديث لا يحولها إلى فشل
      console.error("[cart] refresh failed", error)
    }
  }, [])

  const runCartAction = React.useCallback(
    (
      action: () => Promise<ApiResult<boolean>>,
      errorKey: CartErrorKey,
      successKey?: "ITEM_ADDED"
    ) =>
      new Promise<ApiResult<boolean>>((resolve) => {
        startTransition(async () => {
          let result: ApiResult<boolean>
          try {
            result = await action()
          } catch (error) {
            // دون catch لا ينتهي الوعد أبداً عند انقطاع الاتصال
            console.error("[cart]", error)
            result = { success: false, error: "UNEXPECTED_ERROR" }
          }

          if (result.success) {
            await refreshCart()
            if (successKey) toast.success(t(successKey))
          } else {
            toast.error(
              t(
                result.error === "AUTH_REQUIRED"
                  ? "AUTH_REQUIRED_TITLE"
                  : errorKey
              )
            )
          }

          resolve(result)
        })
      }),
    [refreshCart, t]
  )

  const addItem = React.useCallback(
    (input: AddToCartInput) =>
      runCartAction(
        () =>
          addToCart({
            product_id: input.product_id,
            variant_id: input.variant_id,
            quantity: input.quantity,
          }),
        "ADD_ERROR",
        "ITEM_ADDED"
      ),
    [runCartAction]
  )

  const updateItemQuantity = React.useCallback(
    (itemId: string, quantity: number) =>
      runCartAction(
        () => updateCartItem({ item_id: itemId, quantity }),
        "UPDATE_ERROR"
      ),
    [runCartAction]
  )

  const removeItem = React.useCallback(
    (itemId: string) =>
      runCartAction(
        () => removeCartItem({ item_id: itemId }),
        "REMOVE_ERROR"
      ),
    [runCartAction]
  )

  const totalItemsCount = React.useMemo(
    () =>
      cart?.items?.reduce((acc, item) => acc + Number(item.quantity), 0) ?? 0,
    [cart]
  )

  const value = React.useMemo<CartContextType>(
    () => ({
      cart,
      addItem,
      updateItemQuantity,
      removeItem,
      isPending,
      totalItemsCount,
    }),
    [cart, addItem, updateItemQuantity, removeItem, isPending, totalItemsCount]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

/**
 * سلة التسوق وعملياتها.
 *
 * - `cart` / `totalItemsCount`: محتوى السلة ومجموع الكميات.
 * - `addItem`: إضافة منتج.
 * - `updateItemQuantity`: تعديل كمية عنصر.
 * - `removeItem`: حذف عنصر.
 * - `isPending`: هل توجد عملية جارية.
 *
 * @example
 * const { addItem, isPending } = useCart()
 * const result = await addItem({ product_id, variant_id, quantity: 2 })
 *
 * @throws {Error} إذا استخدم خارج `CartProvider`.
 */
export function useCart() {
  const context = React.useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
