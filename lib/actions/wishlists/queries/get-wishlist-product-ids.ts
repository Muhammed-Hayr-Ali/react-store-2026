/**
 * @file lib/actions/wishlists/queries/get-wishlist-product-ids.ts
 * @description Retrieves an array of product IDs present in the user's wishlist.
 */

"use server"

import type { ApiResult } from "@/lib/actions/types/utils"
import { createServerClient } from "@/lib/database/supabase/server"

/**
 * تجلب مصفوفة بمعرفات المنتجات الموجودة في مفضلة المستخدم الحالي.
 */
export async function getWishlistProductIds(): Promise<ApiResult<string[]>> {
  const supabase = await createServerClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { success: false, error: "PERMISSION_DENIED" }
  }

  const { data, error } = await supabase
    .from("wishlists")
    .select("product_id")
    .eq("user_id", user.id)

  if (error) {
    return {
      success: false,
      error: "GET_WISHLIST_IDS_ERROR",
      details: { database: [error.message] },
    }
  }

  const productIds = (data || []).map((item: { product_id: string }) => item.product_id)

  return {
    success: true,
    data: productIds,
  }
}