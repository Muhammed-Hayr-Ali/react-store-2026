/**
 * @file lib/actions/reviews/mutations/update-review-status.ts
 * @description Updates a review's approval status after permission check.
 */

"use server"

import { revalidatePath } from "next/cache"

import type { ApiResult } from "@/lib/actions/types/utils"
import { createServerClient } from "@/lib/database/supabase/server"

 import { getValidationDetails } from "../../validation"
import { updateReviewStatusSchema, type UpdateReviewStatusInput } from "../schemas"
import type { ProductReview } from "../types"

export async function updateReviewStatus(
  input: UpdateReviewStatusInput
): Promise<ApiResult<ProductReview>> {
  
 
  // 2. التحقق من صحة المدخلات
  const validation = updateReviewStatusSchema.safeParse(input)
  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: getValidationDetails(validation.error),
    }
  }

  const { id, is_approved } = validation.data
  const supabase = await createServerClient()

  // 3. تحديث حالة التعليق في قاعدة البيانات
  const { data, error } = await supabase
    .from("product_reviews")
    .update({
      is_approved,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .maybeSingle()

  if (error) {
    return {
      success: false,
      error: "UPDATE_REVIEW_STATUS_ERROR",
      details: { database: [error.message] },
    }
  }

  if (!data) {
    return { success: false, error: "REVIEW_NOT_FOUND" }
  }

  // 4. تحديث الكاش لتحديث واجهة المتجر ولوحة التحكم
  revalidatePath("/", "layout")
  return { success: true, data: data as ProductReview }
}