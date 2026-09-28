"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { Review, CreateReviewInput, createReviewSchema } from "../types"

/**
 * إضافة تقييم جديد لمنتج (يجب أن يكون المستخدم مسجل الدخول)
 */
export async function createReview(
  data: CreateReviewInput
): Promise<ApiResult<Review | null>> {
  // 1. التحقق من صحة البيانات (Validation)
  const validation = createReviewSchema.safeParse(data)
  if (!validation.success) {
    const details: Record<string, string[]> = {}
    for (const issue of validation.error.issues) {
      const path = issue.path.join(".") || "root"
      if (!details[path]) details[path] = []
      details[path].push(issue.message)
    }
    return { success: false, error: "VALIDATION_ERROR", details }
  }

  // 2. التحقق من تسجيل الدخول
  const supabase = await createServerClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: "UNAUTHORIZED_ACCESS" }
  }

  // 3. تنظيف البيانات
  const cleanData = {
    ...validation.data,
    comment: validation.data.comment === "" ? null : validation.data.comment,
    user_id: user.id,
  }

  // 4. الإدراج في قاعدة البيانات
  const { data: newReview, error: insertError } = await supabase
    .from("product_reviews")
    .insert(cleanData)
    .select()
    .single()

  // 5. معالجة الأخطاء
  if (insertError) {
    if (insertError.code === "23505") {
      // unique violation: المستخدم قيّم هذا المنتج مسبقاً
      return {
        success: false,
        error: "REVIEW_ALREADY_EXISTS",
        details: { database: ["لقد قمت بتقييم هذا المنتج مسبقاً"] },
      }
    }
    if (insertError.code === "23503") {
      // foreign key violation: المنتج غير موجود
      return {
        success: false,
        error: "PRODUCT_NOT_FOUND",
        details: { database: ["المنتج المحدد غير موجود"] },
      }
    }
    return {
      success: false,
      error: "CREATE_REVIEW_ERROR",
      details: { database: [insertError.message] },
    }
  }

  return { success: true, data: newReview as Review }
}
