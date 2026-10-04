/**
 * @file lib/actions/reviews/mutations/delete.ts
 * @description Server Action to permanently remove a review.
 */

"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { hasPermission, PERMISSIONS } from "../../role"

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

  // 2. Parallel permission checks (إشراف كامل أو حذف المراجعة الخاصة)
  const [canModerate, canDeleteOwn] = await Promise.all([
    hasPermission(PERMISSIONS.MODERATE_REVIEWS),
    hasPermission(PERMISSIONS.DELETE_REVIEW),
  ])

  if (!canModerate && !canDeleteOwn) {
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

  // 4. Delete record: إذا كان يملك صلاحية MODERATE_REVIEWS يحذف أي مراجعة، وإلا يحذف مراجعته فقط
  let query = supabase.from("product_reviews").delete().eq("id", reviewId)

  if (!canModerate) {
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
