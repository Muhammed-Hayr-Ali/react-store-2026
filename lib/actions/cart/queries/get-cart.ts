/**
 * @file lib/actions/cart/queries/get-cart.ts
 * @description Fetches the user's active cart with strict typing and resolves ONLY variant-specific images if available.
 */

"use server"

import type { ApiResult } from "@/lib/actions/types/utils"
import { createServerClient } from "@/lib/database/supabase/server"
import type { CartQueryResult, CartItemQueryResult } from "../types"

interface ProductImageRecord {
  url: string
  is_primary: boolean
  variant_sku?: string | null
}

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
        product_images (url, is_primary, variant_sku)
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
    const rawProduct = item.products
    const rawVariant = item.product_variants

    const product = Array.isArray(rawProduct) ? rawProduct[0] : rawProduct
    const variant = Array.isArray(rawVariant) ? rawVariant[0] : rawVariant

    const productImages = (product?.product_images ??
      []) as ProductImageRecord[]
    const variantSku = variant?.sku ?? null

    // تصفية الصور الخاصة بهذا المتغير فقط عبر الـ variant_sku
    const variantImages = variantSku
      ? productImages.filter((img) => img.variant_sku === variantSku)
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
        product_images: productImages.map((img) => ({
          url: img.url,
          is_primary: img.is_primary,
          variant_sku: img.variant_sku,
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
