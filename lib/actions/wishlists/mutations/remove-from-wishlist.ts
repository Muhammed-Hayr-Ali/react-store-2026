/**
 * @file lib/actions/wishlists/mutations/remove-from-wishlist.ts
 * @description Removes a product from the user's wishlist.
 */

"use server"

import { revalidatePath } from "next/cache"

import type { ApiResult } from "@/lib/actions/types/utils"
import { createServerClient } from "@/lib/database/supabase/server"
import { getValidationDetails } from "@/lib/actions/validation"

import { wishlistSchema, type WishlistInput } from "../schemas"

export async function removeFromWishlist(
  input: WishlistInput
): Promise<ApiResult<null>> {
  const validation = wishlistSchema.safeParse(input)
  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: getValidationDetails(validation.error),
    }
  }

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
    .delete()
    .eq("user_id", user.id)
    .eq("product_id", validation.data.product_id)
    .select("id")
    .maybeSingle()

  if (error) {
    return {
      success: false,
      error: "REMOVE_FROM_WISHLIST_ERROR",
      details: { database: [error.message] },
    }
  }

  if (!data) {
    return { success: false, error: "WISHLIST_ITEM_NOT_FOUND" }
  }

  revalidatePath("/", "layout")
  return { success: true, data: null }
}
