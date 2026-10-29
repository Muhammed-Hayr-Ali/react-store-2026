/**
 * @file lib/actions/store/product-details/reviews/mutations/update-review.ts
 * @description Updates an existing product review ensuring ownership verification.
 */

"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import type { ApiResult } from "@/lib/actions/types/utils"
import { getCurrentUser } from "@/lib/actions/users/queries/get-current-user"
import { revalidatePath } from "next/cache"

export interface UpdateReviewInput {
  reviewId: string
  rating: number
  content?: string | null
}

export async function updateReview(
  input: UpdateReviewInput
): Promise<ApiResult<{ id: string }>> {
  const { reviewId, rating, content } = input

  if (!reviewId || typeof reviewId !== "string") {
    return {
      success: false,
      error: "INVALID_REVIEW_ID",
      details: { database: ["Review ID is required."] },
    }
  }

  if (rating < 1 || rating > 5) {
    return {
      success: false,
      error: "INVALID_RATING",
      details: { database: ["Rating must be between 1 and 5."] },
    }
  }

  // 1. التحقق من تسجيل الدخول والمستخدم الحالي
  const userResult = await getCurrentUser()
  if (!userResult.success || !userResult.data) {
    return { success: false, error: "UNAUTHORIZED" }
  }

  const currentUser = userResult.data
  const supabase = await createServerClient()

  // 2. التحقق من وجود التعليق وملكيته قبل التعديل
  const { data: existingReview, error: fetchError } = await supabase
    .from("product_reviews")
    .select()
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
      details: { database: ["You are not allowed to update this review."] },
    }
  }

  // 3. تنفيذ التعديل (قد يتطلب إعادة ضبط الحالة لـ is_approved = false حسب سياسة المتجر، هنا نحدث المحتوى والتقييم)
  const { error: updateError } = await supabase
    .from("product_reviews")
    .update({
      rating,
      content: content ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", reviewId)

  if (updateError) {
    console.error("[updateReview] Database update failed", {
      reviewId,
      code: updateError.code,
      message: updateError.message,
    })
    return {
      success: false,
      error: "UPDATE_REVIEW_ERROR",
      details: { database: [updateError.message] },
    }
  }

  revalidatePath("/", "layout")
  return { success: true, data: { id: reviewId } }
}
