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

/**
 * @interface ToggleWishlistResult
 * @description يحدد النتيجة المرتجعة من دالة تبديل المفضلة لضمان أمان الأنواع بدلاً من استخدام any.
 */
export interface ToggleWishlistResult {
  success: boolean
  error?: string
}

/**
 * @interface WishlistContextType
 * @description يحدد بنية البيانات والدوال المتاحة عبر السياق (Context).
 */
interface WishlistContextType {
  /**
   * قائمة معرفات المنتجات الموجودة حالياً في مفضلة المستخدم.
   * @returns {string[]} مصفوفة تحتوي على معرفات المنتجات.
   */
  wishlistIds: string[]

  /**
   * دالة للتحقق السريع مما إذا كان منتج معين موجوداً في المفضلة أم لا.
   * @param {string} productId - معرف المنتج المراد التحقق منه.
   * @returns {boolean} تعيد true إذا كان موجوداً، وإلا false.
   */
  isInWishlist: (productId: string) => boolean

  /**
   * دالة لتبديل حالة المنتج (إضافة/إزالة) مع تحديث متفائل (Optimistic Update).
   *
   * @param {string} productId - معرف المنتج المراد تبديل حالته.
   * @returns {Promise<ToggleWishlistResult>} تعيد وعداً (Promise) يحمل كائن النتيجة:
   * - `success: true` في حال نجاح العملية على الخادم وتحديث القائمة.
   * - `success: false` مع خصائص الخطأ (مثل `error`) في حال فشل المصادقة أو حدوث مشكلة تقنية.
   */
  toggleWishlist: (productId: string) => Promise<ToggleWishlistResult>

  /**
   * دالة لجلب أحدث معرفات المفضلة من السيرفر ومزامنتها محلياً.
   * @returns {Promise<void>}
   */
  refreshWishlist: () => Promise<void>
}

const WishlistContext = React.createContext<WishlistContextType | undefined>(
  undefined
)

export function WishlistProvider({
  initialWishlistIds,
  children,
}: {
  initialWishlistIds: string[]
  children: React.ReactNode
}) {
  const [wishlistIds, setWishlistIds] =
    React.useState<string[]>(initialWishlistIds)

  /**
   * مهمة الارجاع: التحقق من وجود المنتج في مصفوفة الـ IDs.
   */
  const isInWishlist = React.useCallback(
    (productId: string) => wishlistIds.includes(productId),
    [wishlistIds]
  )

  /**
   * مهمة الارجاع: جلب أحدث قائمة من السيرفر وتحديث الحالة المحلية.
   */
  const refreshWishlist = async () => {
    const result = await getWishlistProductIds()
    if (result.success && result.data) {
      setWishlistIds(result.data)
    }
  }

  /**
   * مهمة الارجاع:
   * 1. تنفيذ التحديث المتفائل (Optimistic Update) محلياً لاستجابة فورية.
   * 2. تنفيذ إجراء الخادم (إضافة أو إزالة).
   * 3. التراجع عن التعديل (Rollback) في حال فشل الطلب.
   * 4. إرجاع كائن نتيجة محدد الأنواع (`ToggleWishlistResult`) للـ UI.
   */
  const toggleWishlist = async (
    productId: string
  ): Promise<ToggleWishlistResult> => {
    const exists = isInWishlist(productId)

    let result: ToggleWishlistResult
    if (exists) {
      result = await removeFromWishlist({ product_id: productId })
    } else {
      result = await addToWishlist({ product_id: productId })
    }


    // إذا فشل الطلب، نتراجع عن التحديث المتفائل
    if (result.success) {
      setWishlistIds((prev) =>
        exists ? prev.filter((id) => id !== productId) : [...prev, productId]
      )
      await refreshWishlist()
    }

    // إرجاع النتيجة للـ UI للتعامل مع الإشعارات بدقة
    return result
  }

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        isInWishlist,
        toggleWishlist,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

/**
 * هوك لاستخدام سياق المفضلة مع التأكد من نطاق الـ Provider.
 * @throws {Error} إذا تم استخدامه خارج نطاق `WishlistProvider`.
 * @returns {WishlistContextType} يعيد كائن السياق الذي يحتوي على:
 * - `wishlistIds`: مصفوفة معرفات المنتجات الموجودة في المفضلة.
 * - `isInWishlist`: دالة للتحقق مما إذا كان المنتج موجوداً في المفضلة.
 * - `toggleWishlist`: دالة لتبديل حالة المنتج (إضافة/إزالة) مع تحديث متفائل وإرجاع نتيجة العملية.
 * - `refreshWishlist`: دالة لمزامنة وجلب أحدث معرفات المفضلة من الخادم.
 */

export function useWishlist() {
  const context = React.useContext(WishlistContext)
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider")
  }
  return context
}
