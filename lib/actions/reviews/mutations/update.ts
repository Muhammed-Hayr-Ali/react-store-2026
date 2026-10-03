/**
 * @file lib/actions/reviews/mutations/update.ts
 * @description Server Action to modify an existing review owned by the authenticated user.
 */

"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { Review, UpdateReviewInput } from "../types"
import { updateReviewSchema } from "../schemas"

// ============================================================================
// Main Action Function
// ============================================================================

export async function updateReview(
  data: UpdateReviewInput
): Promise<ApiResult<Review | null>> {
  // 1. Validate payload
  const validation = updateReviewSchema.safeParse(data)
  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: validation.error.flatten().fieldErrors,
    }
  }

  // 2. Authenticate user
  const supabase = await createServerClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      success: false,
      error: "UNAUTHORIZED_ACCESS",
    }
  }

  const cleanData = {
    ...validation.data,
    comment: validation.data.comment === "" ? null : validation.data.comment,
  }

  const { id, ...updatePayload } = cleanData

  // 3. Update review with user ownership guard
  const { data: updatedReview, error } = await supabase
    .from("product_reviews")
    .update(updatePayload)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) {
    return {
      success: false,
      error: "UPDATE_REVIEW_ERROR",
      details: { database: [error.message] },
    }
  }

  if (!updatedReview) {
    return {
      success: false,
      error: "REVIEW_NOT_FOUND_OR_UNAUTHORIZED",
      details: { database: ["Review not found or unauthorized to update."] },
    }
  }

  // 4. Invalidate paths
  revalidatePath(`/product/${updatedReview.product_id}`)

  return {
    success: true,
    data: updatedReview as Review,
  }
}
