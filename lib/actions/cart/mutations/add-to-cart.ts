/**
 * @file lib/actions/cart/mutations/add-to-cart.ts
 * @description Adds a product variant to the user's cart or increments quantity if it already exists.
 */

"use server"

import { revalidatePath } from "next/cache"
import type { ApiResult } from "@/lib/actions/types/utils"
import { createServerClient } from "@/lib/database/supabase/server"
import { getValidationDetails } from "@/lib/actions/validation"
import { addToCartSchema, type AddToCartInput } from "../schemas"

export async function addToCart(input: AddToCartInput): Promise<ApiResult<boolean>> {
  const validation = addToCartSchema.safeParse(input)
  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: getValidationDetails(validation.error),
    }
  }

  const supabase = await createServerClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { success: false, error: "PERMISSION_DENIED" }
  }

  const { product_id, variant_id, quantity } = validation.data

  // 1. البحث عن سلة المستخدم النشطة
  const { data: existingCart, error: cartError } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (cartError && cartError.code !== "PGRST116") {
    return { success: false, error: "CART_FETCH_ERROR" }
  }

  let cartId = existingCart?.id

  // إذا لم تكن السلة موجودة، نقوم بإنشائها
  if (!cartId) {
    const { data: newCart, error: createError } = await supabase
      .from("carts")
      .insert({ user_id: user.id })
      .select("id")
      .single()

    if (createError || !newCart) {
      return { success: false, error: "CART_CREATE_ERROR" }
    }
    cartId = newCart.id
  }

  // 2. التحقق هل نفس المنتج (بنفس الـ variant) موجود مسبقاً في السلة؟
  const { data: existingItem, error: fetchItemError } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("cart_id", cartId)
    .eq("variant_id", variant_id)
    .single()

  if (fetchItemError && fetchItemError.code !== "PGRST116") {
    return { success: false, error: "CART_FETCH_ERROR" }
  }

  if (existingItem) {
    // إذا كان موجوداً مسبقاً: قم بتحديث (زيادة) الكمية الحالية
    const newQuantity = existingItem.quantity + quantity
    const { error: updateError } = await supabase
      .from("cart_items")
      .update({ quantity: newQuantity })
      .eq("id", existingItem.id)

    if (updateError) {
      return { success: false, error: "CART_UPDATE_ERROR" }
    }
  } else {
    // إذا لم يكن موجوداً: أضفه كعنصر جديد تماماً
    const { error: insertError } = await supabase
      .from("cart_items")
      .insert({
        cart_id: cartId,
        product_id,
        variant_id,
        quantity,
      })

    if (insertError) {
      return { success: false, error: "CART_ADD_ERROR" }
    }
  }

  revalidatePath("/", "layout")
  return { success: true, data: true }
}