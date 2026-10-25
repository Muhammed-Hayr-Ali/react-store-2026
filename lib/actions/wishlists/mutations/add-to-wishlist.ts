/**
 * @file lib/actions/wishlists/mutations/add-to-wishlist.ts
 * @description Adds a product to the user's wishlist.
 */

"use server"

import { revalidatePath } from "next/cache"

import type { ApiResult } from "@/lib/actions/types/utils"
import { createServerClient } from "@/lib/database/supabase/server"
import { getValidationDetails } from "@/lib/actions/validation"

import { wishlistSchema, type WishlistInput } from "../schemas"
import type { Wishlist } from "../types"
import { getCurrentUser } from "../../users/queries/get-current-user"

export async function addToWishlist(
  input: WishlistInput
): Promise<ApiResult<Wishlist>> {
  const validation = wishlistSchema.safeParse(input)
  if (!validation.success) {
    console.error("Wishlist Validation Error:", validation.error)
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: getValidationDetails(validation.error),
    }
  }

  const supabase = await createServerClient()

  const result = await getCurrentUser()

  if (!result.success) {
    return { success: false, error: "AUTH_REQUIRED" }
  }

  const userId = result.data?.id

  const { data, error } = await supabase
    .from("wishlists")
    .insert({
      user_id: userId,
      product_id: validation.data.product_id,
    })
    .select("*")
    .single()

  if (error) {
    console.error(
      "Supabase Insert Wishlist Error Code:",
      error.code,
      "Message:",
      error.message,
      "Details:",
      error.details
    )

    if (error.code === "23505") {
      return {
        success: false,
        error: "WISHLIST_ITEM_ALREADY_EXISTS",
        details: { database: [error.message] },
      }
    }

    return {
      success: false,
      error: "ADD_TO_WISHLIST_ERROR",
      details: { database: [error.message] },
    }
  }

  revalidatePath("/", "layout")
  return { success: true, data: data as Wishlist }
}
