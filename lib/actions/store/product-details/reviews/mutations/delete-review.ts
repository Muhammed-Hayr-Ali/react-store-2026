/**
 * @file lib/actions/store/product-details/reviews/mutations/delete-review.ts
 * @description Deletes an existing product review ensuring ownership verification.
 */

"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import type { ApiResult } from "@/lib/actions/types/utils"
import { getCurrentUser } from "@/lib/actions/users/queries/get-current-user"
import { revalidatePath } from "next/cache"

export async function deleteReview(
  reviewId: string
): Promise<ApiResult<{ id: string }>> {
  if (!reviewId || typeof reviewId !== "string") {
    return {
      success: false,
      error: "INVALID_REVIEW_ID",
      details: { database: ["Review ID is required."] },
    }
  }

  // 1. التحقق من تسجيل الدخول والمستخدم الحالي
  const userResult = await getCurrentUser()
  if (!userResult.success || !userResult.data) {
    return { success: false, error: "UNAUTHORIZED" }
  }

  const currentUser = userResult.data
  const supabase = await createServerClient()

  // 2. التحقق من وجود التعليق وملكيته قبل الحذف
  const { data: existingReview, error: fetchError } = await supabase
    .from("product_reviews")
    .select("id, user_id")
    .eq("id", reviewId)
    .maybeSingle()

  if (fetchError || !existingReview) {
    return {
      success: false,
      error: "REVIEW_NOT_FOUND",
      details: { database: ["Review not found."] },
    }
  }

  if (existingReview.user_id !== currentUser.id) {
    return {
      success: false,
      error: "FORBIDDEN",
      details: { database: ["You are not allowed to delete this review."] },
    }
  }

  // 3. تنفيذ الحذف
  const { error: deleteError } = await supabase
    .from("product_reviews")
    .delete()
    .eq("id", reviewId)

  if (deleteError) {
    console.error("[deleteReview] Database delete failed", {
      reviewId,
      code: deleteError.code,
      message: deleteError.message,
    })
    return {
      success: false,
      error: "DELETE_REVIEW_ERROR",
      details: { database: [deleteError.message] },
    }
  }

  revalidatePath("/", "layout")

  return { success: true, data: { id: reviewId } }
}
