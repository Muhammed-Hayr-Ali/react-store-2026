/**
 * @file lib/actions/reviews/mutations/delete.ts
 * @description Server Action to permanently remove a review.
 */

"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { hasRole, hasPermission, ROLES, PERMISSIONS } from "../../role"

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

  // 2. Parallel authorization checks using typed constants
  const [isAdmin, isCustomer, canDelete] = await Promise.all([
    hasRole(ROLES.ADMIN),
    hasRole(ROLES.CUSTOMER),
    hasPermission(PERMISSIONS.DELETE_REVIEW),
  ])

  if (!isAdmin && !isCustomer) {
    return {
      success: false,
      error: "UNAUTHORIZED_ACCESS",
    }
  }

  if (!canDelete) {
    return {
      success: false,
      error: "PERMISSION_DENIED",
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

  // 4. Delete record: Admins can delete any review, regular customers only delete their own
  let query = supabase.from("product_reviews").delete().eq("id", reviewId)

  if (!isAdmin) {
    query = query.eq("user_id", user.id)
  }

  const { error } = await query

  if (error) {
    return {
      success: false,
      error: "DELETE_REVIEW_ERROR",
      details: { database: [error.message] },
    }
  }

  // 5. Invalidate caches
  revalidatePath("/", "layout")

  return {
    success: true,
    data: true,
  }
}
