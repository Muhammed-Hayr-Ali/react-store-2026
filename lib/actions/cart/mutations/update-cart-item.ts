/**
 * @file lib/actions/cart/mutations/update-cart-item.ts
 * @description Updates the quantity of a specific cart item.
 */

"use server"

import { revalidatePath } from "next/cache"
import type { ApiResult } from "@/lib/actions/types/utils"
import { createServerClient } from "@/lib/database/supabase/server"
import { getValidationDetails } from "@/lib/actions/validation"
import { updateCartItemSchema, type UpdateCartItemInput } from "../schemas"
import { getCurrentUser } from "../../users/queries/get-current-user"

export async function updateCartItem(input: UpdateCartItemInput): Promise<ApiResult<boolean>> {
  const validation = updateCartItemSchema.safeParse(input)
  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: getValidationDetails(validation.error),
    }
  }

  const supabase = await createServerClient()
  const result = await getCurrentUser()

  if (!result.success) {
    return { success: false, error: "LOGIN_REQUIRED" }
  }

 
  const { item_id, quantity } = validation.data

  const { error: updateError } = await supabase
    .from("cart_items")
    .update({ quantity })
    .eq("id", item_id)

  if (updateError) {
    return { success: false, error: "CART_UPDATE_ERROR" }
  }

  revalidatePath("/", "layout")
  return { success: true, data: true }
}