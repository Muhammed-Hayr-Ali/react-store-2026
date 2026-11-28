"use client"

/**
 * @file lib/context/wishlist-context.tsx
 * @description Wishlist context and provider with optimistic updates, strict typing (no any), and explicit result returns for UI handling.
 */

import * as React from "react"
import {
  addToWishlist,
  removeFromWishlist,
  getWishlistProductIds,
} from "@/lib/actions/wishlists"

/** نتيجة تبديل حالة منتج في المفضلة. */
export interface ToggleWishlistResult {
  /** هل نجحت العملية على الخادم؟ */
  success: boolean
  /** رمز الخطأ عند الفشل. */
  error?: string
}

interface WishlistContextType {
  /** معرفات المنتجات في المفضلة، وتشمل التغييرات التي لم يؤكدها الخادم بعد. */
  wishlistIds: string[]
  /**
   * هل المنتج في المفضلة؟ مناسب لتلوين أيقونة القلب.
   *
   * @param productId - معرف المنتج.
   */
  isInWishlist: (productId: string) => boolean
  /**
   * يضيف المنتج أو يزيله. تتغير الواجهة فوراً، ثم تتراجع إذا فشل الطلب.
   * الضغط المتكرر أثناء الإرسال لا يرسل طلباً جديداً، بل يعيد وعد الطلب الجاري.
   * لا يعرض إشعارات؛ اعرضها حسب النتيجة.
   *
   * @param productId - معرف المنتج.
   * @returns `success` و`error` عند الفشل. **لا يرمي خطأ**.
   */
  toggleWishlist: (productId: string) => Promise<ToggleWishlistResult>
  /**
   * هل يوجد طلب جارٍ لهذا المنتج؟ مناسب لتعطيل زر المفضلة مؤقتاً.
   *
   * @param productId - معرف المنتج.
   */
  isWishlistPending: (productId: string) => boolean
  /**
   * يجلب المفضلة من الخادم ويزامنها.
   * عند الفشل تبقى القائمة الحالية كما هي.
   */
  refreshWishlist: () => Promise<void>
}

const WishlistContext = React.createContext<WishlistContextType | undefined>(
  undefined
)

const setMembership = (ids: string[], productId: string, included: boolean) => {
  const others = ids.filter((id) => id !== productId)
  return included ? [...others, productId] : others
}

/**
 * يوفر المفضلة لكل المكونات الفرعية.
 * تتم مزامنتها تلقائياً عند وصول `initialWishlistIds` جديدة من الخادم.
 */
export function WishlistProvider({
  initialWishlistIds,
  children,
}: {
  initialWishlistIds: string[]
  children: React.ReactNode
}) {
  // ما أكده الخادم
  const [savedIds, setSavedIds] = React.useState(initialWishlistIds)
  // التغييرات المتفائلة: معرف المنتج ← الحالة المطلوبة
  const [optimistic, setOptimistic] = React.useState<Record<string, boolean>>(
    {}
  )
  const requestsRef = React.useRef(
    new Map<string, Promise<ToggleWishlistResult>>()
  )

  // دون هذه المزامنة تبقى مفضلة المستخدم السابق بعد تسجيل الخروج
  const [prevInitialIds, setPrevInitialIds] = React.useState(initialWishlistIds)
  if (prevInitialIds !== initialWishlistIds) {
    setPrevInitialIds(initialWishlistIds)
    setSavedIds(initialWishlistIds)
  }

  const wishlistIds = React.useMemo(
    () =>
      Object.entries(optimistic).reduce(
        (ids, [productId, included]) => setMembership(ids, productId, included),
        savedIds
      ),
    [savedIds, optimistic]
  )

  const idSet = React.useMemo(() => new Set(wishlistIds), [wishlistIds])

  const isInWishlist = React.useCallback(
    (productId: string) => idSet.has(productId),
    [idSet]
  )

  const isWishlistPending = React.useCallback(
    (productId: string) => productId in optimistic,
    [optimistic]
  )

  const refreshWishlist = React.useCallback(async () => {
    try {
      const result = await getWishlistProductIds()
      if (result.success && result.data) {
        setSavedIds(result.data)
      }
    } catch (error) {
      console.error("[wishlist] refresh failed", error)
    }
  }, [])

  const toggleWishlist = React.useCallback(
    (productId: string): Promise<ToggleWishlistResult> => {
      const running = requestsRef.current.get(productId)
      if (running) return running

      const shouldAdd = !idSet.has(productId)
      setOptimistic((current) => ({ ...current, [productId]: shouldAdd }))

      const request = (async (): Promise<ToggleWishlistResult> => {
        try {
          const result: ToggleWishlistResult = shouldAdd
            ? await addToWishlist({ product_id: productId })
            : await removeFromWishlist({ product_id: productId })

          if (result.success) {
            setSavedIds((ids) => setMembership(ids, productId, shouldAdd))
          }
          return result
        } catch (error) {
          console.error("[wishlist]", error)
          return { success: false, error: "UNEXPECTED_ERROR" }
        } finally {
          // إزالة التغيير المتفائل: عند الفشل يعني هذا التراجع
          setOptimistic((current) => {
            const next = { ...current }
            delete next[productId]
            return next
          })
        }
      })()

      requestsRef.current.set(productId, request)
      void request.finally(() => requestsRef.current.delete(productId))
      return request
    },
    [idSet]
  )

  const value = React.useMemo<WishlistContextType>(
    () => ({
      wishlistIds,
      isInWishlist,
      toggleWishlist,
      isWishlistPending,
      refreshWishlist,
    }),
    [
      wishlistIds,
      isInWishlist,
      toggleWishlist,
      isWishlistPending,
      refreshWishlist,
    ]
  )

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  )
}

/**
 * قائمة المفضلة وعملياتها.
 *
 * - `wishlistIds`: معرفات المنتجات المفضلة.
 * - `isInWishlist`: هل المنتج مفضل.
 * - `toggleWishlist`: إضافة أو إزالة مع استجابة فورية.
 * - `isWishlistPending`: هل طلب المنتج جارٍ.
 * - `refreshWishlist`: مزامنة مع الخادم.
 *
 * @example
 * const { isInWishlist, toggleWishlist } = useWishlist()
 * const result = await toggleWishlist(product.id)
 *
 * @throws {Error} إذا استخدم خارج `WishlistProvider`.
 */
export function useWishlist() {
  const context = React.useContext(WishlistContext)
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider")
  }
  return context
}
