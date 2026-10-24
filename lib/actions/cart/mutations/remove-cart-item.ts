/**
 * @file lib/actions/cart/mutations/remove-cart-item.ts
 * @description Removes a specific item from the cart.
 */

"use server"

import { revalidatePath } from "next/cache"
import type { ApiResult } from "@/lib/actions/types/utils"
import { createServerClient } from "@/lib/database/supabase/server"
import { getValidationDetails } from "@/lib/actions/validation"
import { removeCartItemSchema, type RemoveCartItemInput } from "../schemas"

export async function removeCartItem(input: RemoveCartItemInput): Promise<ApiResult<boolean>> {
  const validation = removeCartItemSchema.safeParse(input)
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

  const { item_id } = validation.data

  const { error: deleteError } = await supabase
    .from("cart_items")
    .delete()
    .eq("id", item_id)

  if (deleteError) {
    return { success: false, error: "CART_DELETE_ERROR" }
  }

  revalidatePath("/", "layout")
  return { success: true, data: true }
}