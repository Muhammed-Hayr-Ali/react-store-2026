/**
 * @file lib/actions/wishlists/queries/get-wishlist.ts
 * @description Retrieves the current user's wishlist with full product details.
 */

"use server"

import type { ApiResult } from "@/lib/actions/types/utils"
import { createServerClient } from "@/lib/database/supabase/server"
import type { WishlistQueryResult } from "../types"

/**
 * تجلب قائمة المفضلة الخاصة بالمستخدم الحالي مع تفاصيل المنتجات الكاملة.
 */
export async function getWishlist(): Promise<ApiResult<WishlistQueryResult[]>> {
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
    .select(`
      id,
      user_id,
      product_id,
      created_at,
      products:product_id (
        id,
        name,
        slug,
        description,
        is_active,
        is_featured,
        category:categories (id, name, name_ar, slug),
        brand:brands (id, name, name_ar, slug, image_url),
        product_variants (id, sku, name, price, stock_quantity, track_inventory, attributes),
        product_images (id, url, alt_text, is_primary, variant_sku)
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    return {
      success: false,
      error: "GET_WISHLIST_ERROR",
      details: { database: [error.message] },
    }
  }

  return {
    success: true,
    data: (data as unknown as WishlistQueryResult[]) || [],
  }
}