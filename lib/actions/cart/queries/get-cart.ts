/**
 * @file lib/actions/cart/queries/get-cart.ts
 * @description Fetches the user's active cart with strict typing and resolves ONLY variant-specific images if available.
 */

"use server"

import type { ApiResult } from "@/lib/actions/types/utils"
import { createServerClient } from "@/lib/database/supabase/server"
import type { CartQueryResult, CartItemQueryResult } from "../types"

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
    return {
      success: false,
      error: "CART_FETCH_ERROR",
      details: { database: [cartError.message] },
    }
  }

  if (!cart) {
    return { success: true, data: null }
  }

  // 2. جلب عناصر السلة مع تفاصيل المنتجات وصورها، ومتغيرات المنتج
  const { data: items, error: itemsError } = await supabase
    .from("cart_items")
    .select(
      `
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
         description,
     product_images (url, is_primary, variant_id)
      ),
      product_variants (
        id,
        price,
        stock_quantity,
        track_inventory,
        sku
      )
    `
    )
    .eq("cart_id", cart.id)
    .order("created_at", { ascending: true })

  if (itemsError) {
    console.error("Error fetching cart items:", itemsError.message)
    return {
      success: false,
      error: "CART_FETCH_ERROR",
      details: { database: [itemsError.message] },
    }
  }

  // 3. معالجة العناصر وجلب صورة المتغير الخاصة فقط (أو null إذا لم توجد)
  const processedItems: CartItemQueryResult[] = (items || []).map((item) => {
    const product = item.products
    const variant = item.product_variants

    const productImages = product?.product_images ?? []
    const variantId = variant?.id ?? null

    // تصفية الصور الخاصة بهذا المتغير فقط عبر variant_id
    const variantImages = variantId
      ? productImages.filter((img) => img.variant_id === variantId)
      : []

    // البحث عن الصورة الأساسية للمتغير أو أول صورة للمتغير (وإلا إرجاع null تماماً)
    const matchedImage =
      variantImages.find((img) => img.is_primary) || variantImages[0] || null

    return {
      id: item.id,
      cart_id: item.cart_id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      quantity: item.quantity,
      created_at: item.created_at,
      updated_at: item.updated_at,
      products: {
        id: product?.id ?? "",
        name: product?.name ?? "",
        slug: product?.slug ?? "",
        description: product?.description ?? "",
        product_images: productImages.map((img) => ({
          url: img.url,
          is_primary: img.is_primary,
          variant_id: img.variant_id,
        })),
      },
      product_variants: {
        id: variant?.id ?? "",
        price: Number(variant?.price ?? 0),
        stock_quantity: Number(variant?.stock_quantity ?? 0),
        track_inventory: Boolean(variant?.track_inventory ?? true),
        sku: variant?.sku ?? "",
      },
      resolved_image_url: matchedImage?.url ?? null,
    }
  })

  const fullCart: CartQueryResult = {
    ...cart,
    items: processedItems,
  }

  return { success: true, data: fullCart }
}
