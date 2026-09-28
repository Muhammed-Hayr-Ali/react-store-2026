"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { Review, UpdateReviewInput, updateReviewSchema } from "../types"

export async function updateReview(
  data: UpdateReviewInput
): Promise<ApiResult<Review | null>> {
  const validation = updateReviewSchema.safeParse(data)
  if (!validation.success) {
    const details: Record<string, string[]> = {}
    for (const issue of validation.error.issues) {
      const path = issue.path.join(".") || "root"
      if (!details[path]) details[path] = []
      details[path].push(issue.message)
    }
    return { success: false, error: "VALIDATION_ERROR", details }
  }

  const supabase = await createServerClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: "UNAUTHORIZED_ACCESS" }
  }

  const cleanData = {
    ...validation.data,
    comment: validation.data.comment === "" ? null : validation.data.comment,
  }

  const { id, ...updatePayload } = cleanData

  // ✅ الأمان: التحديث فقط إذا كان المعرف يطابق ومعرف المستخدم يطابق
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
      error: "UPDATE_ERROR",
      details: { database: [error.message] },
    }
  }

  if (!updatedReview) {
    return {
      success: false,
      error: "NOT_FOUND_OR_UNAUTHORIZED",
      details: { database: ["لا يمكنك تعديل هذا التقييم أو أنه غير موجود"] },
    }
  }

  return { success: true, data: updatedReview as Review }
}
