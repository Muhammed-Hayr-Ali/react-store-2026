/**
 * @file lib/actions/store/product-details/reviews/mutations/update-review.ts
 * @description Updates an existing product review relying solely on Supabase RLS for ownership and permission checks.
 */

"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import type { ApiResult } from "@/lib/actions/types/utils"
import { getCurrentUser } from "@/lib/actions/users/queries/get-current-user"
import {
  updateReviewSchema,
  type UpdateReviewInput,
} from "@/lib/actions/reviews/schemas"
import { getValidationDetails } from "@/lib/actions/validation"
import { revalidatePath } from "next/cache"

export async function updateReview(
  input: UpdateReviewInput
): Promise<ApiResult<{ id: string }>> {
  // 1. التحقق من صحة المدخلات باستخدام Zod
  const validation = updateReviewSchema.safeParse(input)
  if (!validation.success) {
    const validationDetails = getValidationDetails(validation.error)
    console.error("[updateReview] Validation Error:", validationDetails)
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: validationDetails,
    }
  }

  const { reviewId, rating, content } = validation.data

  // 2. التحقق من تسجيل الدخول فقط (الحد الأدنى المطلوب في كود الـ Server Action)
  const userResult = await getCurrentUser()
  if (!userResult.success || !userResult.data) {
    return { success: false, error: "UNAUTHORIZED" }
  }

  const supabase = await createServerClient()

  // 3. تنفيذ التعديل مباشرة 
  // سياسة RLS في قاعدة البيانات (auth.uid() = user_id OR has_permission('manage_reviews')) 
  // هي التي ستتولى رفض أو قبول التعديل بناءً على الملكية أو الصلاحية.
  const { data: updatedReview, error: updateError } = await supabase
    .from("product_reviews")
    .update({
      rating,
      content: content ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", reviewId)
    .select("id")
    .maybeSingle()

  if (updateError) {
    console.error("[updateReview] Database update failed:", {
      code: updateError.code,
      message: updateError.message,
      details: updateError.details,
    })
    return {
      success: false,
      error: "UPDATE_REVIEW_ERROR",
      details: { database: [updateError.message] },
    }
  }

  // إذا لم يتم العثور على التعليق أو أن سياسة RLS رفضت التعديل لعدم التطابق
  if (!updatedReview) {
    return {
      success: false,
      error: "REVIEW_NOT_FOUND_OR_FORBIDDEN",
      details: {
        database: [
          "Review not found or you do not have permission to update it.",
        ],
      },
    }
  }

  revalidatePath("/", "layout")
  return { success: true, data: { id: reviewId } }
}