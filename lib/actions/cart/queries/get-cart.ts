/**
 * @file lib/actions/cart/queries/get-cart.ts
 * @description Fetches the user's active cart with products and variants details.
 */

"use server"

import type { ApiResult } from "@/lib/actions/types/utils"
import { createServerClient } from "@/lib/database/supabase/server"
import type { CartQueryResult } from "../types"

export async function getCart(): Promise<ApiResult<CartQueryResult | null>> {
  const supabase = await createServerClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { success: false, error: "PERMISSION_DENIED" }
  }

  // 1. جلب السلة أولاً للتأكد من وجودها
  const { data: cart, error: cartError } = await supabase
    .from("carts")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (cartError) {
    if (cartError.code === "PGRST116") {
      return { success: true, data: null }
    }
    console.error("Error fetching cart:", cartError.message)
    return { success: false, error: "CART_FETCH_ERROR", details: { database: [cartError.message] } }
  }

  if (!cart) {
    return { success: true, data: null }
  }

  // 2. جلب عناصر السلة مع تفاصيل المنتجات والمتغيرات المتاحة فعلياً
  const { data: items, error: itemsError } = await supabase
    .from("cart_items")
    .select(`
      id,
      cart_id,
      product_id,
      variant_id,
      quantity,
      created_at,
      updated_at,
      products (
        id,
        name,
        slug,
        product_images (url, is_primary)
      ),
      product_variants (
        id,
        price,
        stock_quantity,
        track_inventory,
        sku
      )
    `)
    .eq("cart_id", cart.id)

  if (itemsError) {
    console.error("Error fetching cart items:", itemsError.message)
    return { success: false, error: "CART_FETCH_ERROR", details: { database: [itemsError.message] } }
  }

  const fullCart: CartQueryResult = {
    ...cart,
    items: items || [],
  }

  return { success: true, data: fullCart }
}