"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"

export async function deleteReview(
  reviewId: string
): Promise<ApiResult<boolean>> {
  if (!reviewId || typeof reviewId !== "string") {
    return { success: false, error: "INVALID_ID_PROVIDED" }
  }

  const supabase = await createServerClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: "UNAUTHORIZED_ACCESS" }
  }

  // ✅ الأمان: الحذف فقط إذا كان معرف التقييم ومعرف المستخدم متطابقين
  const { error } = await supabase
    .from("product_reviews")
    .delete()
    .eq("id", reviewId)
    .eq("user_id", user.id)

  if (error) {
    return {
      success: false,
      error: "DELETE_ERROR",
      details: { database: [error.message] },
    }
  }

  return { success: true, data: true }
}
