/**
 * @file lib/actions/reviews/mutations/delete.ts
 * @description Server Action to permanently remove a review owned by the authenticated user.
 */

"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"

// ============================================================================
// Main Action Function
// ============================================================================

export async function deleteReview(
  reviewId: string
): Promise<ApiResult<boolean>> {
  // 1. Validate UUID parameter
  const idValidation = z.string().uuid("INVALID_ID").safeParse(reviewId)
  if (!idValidation.success) {
    return {
      success: false,
      error: "INVALID_ID_PROVIDED",
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

  // 3. Fetch product_id before deletion for cache revalidation
  const { data: reviewRecord } = await supabase
    .from("product_reviews")
    .select("product_id")
    .eq("id", reviewId)
    .eq("user_id", user.id)
    .maybeSingle()

  // 4. Delete record with user ownership guard
  const { error } = await supabase
    .from("product_reviews")
    .delete()
    .eq("id", reviewId)
    .eq("user_id", user.id)

  if (error) {
    return {
      success: false,
      error: "DELETE_REVIEW_ERROR",
      details: { database: [error.message] },
    }
  }

  // 5. Invalidate paths
  if (reviewRecord?.product_id) {
    revalidatePath(`/product/${reviewRecord.product_id}`)
  }
  revalidatePath("/")

  return {
    success: true,
    data: true,
  }
}
