/**
 * @file lib/actions/reviews/mutations/create.ts
 * @description Server Action to insert a customer review for a specific product.
 */

"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { Review, CreateReviewInput } from "../types"
import { createReviewSchema } from "../schemas"
import { hasPermission, PERMISSIONS } from "../../role"

// ============================================================================
// Main Action Function
// ============================================================================

export async function createReview(
  data: CreateReviewInput
): Promise<ApiResult<Review | null>> {
  // 1. Permission check
  const canCreate = await hasPermission(PERMISSIONS.CREATE_REVIEW)
  if (!canCreate) {
    return {
      success: false,
      error: "PERMISSION_DENIED",
    }
  }

  // 2. Validate payload
  const validation = createReviewSchema.safeParse(data)
  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: validation.error.flatten().fieldErrors,
    }
  }

  // 3. Authenticate user session
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

  // 4. Clean payload
  const cleanData = {
    ...validation.data,
    comment: validation.data.comment === "" ? null : validation.data.comment,
    user_id: user.id,
  }

  // 5. Insert into database
  const { data: newReview, error: insertError } = await supabase
    .from("product_reviews")
    .insert(cleanData)
    .select()
    .single()

  if (insertError) {
    if (insertError.code === "23505") {
      return {
        success: false,
        error: "REVIEW_ALREADY_EXISTS",
        details: { database: ["You have already reviewed this product."] },
      }
    }
    if (insertError.code === "23503") {
      return {
        success: false,
        error: "PRODUCT_NOT_FOUND",
        details: { database: ["The specified product does not exist."] },
      }
    }
    return {
      success: false,
      error: "CREATE_REVIEW_ERROR",
      details: { database: [insertError.message] },
    }
  }

  // 6. Invalidate caches
  revalidatePath("/", "layout")

  return {
    success: true,
    data: newReview as Review,
  }
}
