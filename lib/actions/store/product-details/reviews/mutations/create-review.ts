/**
 * @file lib/actions/store/product-details/reviews/mutations/create-review.ts
 * @description Creates a new product review for authenticated users.
 */

"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import type { ApiResult } from "@/lib/actions/types/utils"
import { getCurrentUser } from "@/lib/actions/users/queries/get-current-user"
import { revalidatePath } from "next/cache"

export interface CreateReviewInput {
  productId: string
  rating: number
  content?: string | null
}

export async function createReview(
  input: CreateReviewInput
): Promise<ApiResult<{ id: string }>> {
  const { productId, rating, content } = input

  if (!productId || typeof productId !== "string") {
    return {
      success: false,
      error: "INVALID_PRODUCT_ID",
      details: { database: ["Product ID is required."] },
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

  // 2. (اختياري) التحقق مما إذا كان المستخدم قد قام بتقييم هذا المنتج مسبقاً لمنع التكرار
  const { data: existingReview } = await supabase
    .from("product_reviews")
    .select("id")
    .eq("product_id", productId)
    .eq("user_id", currentUser.id)
    .maybeSingle()

  if (existingReview) {
    return {
      success: false,
      error: "REVIEW_ALREADY_EXISTS",
      details: { database: ["You have already reviewed this product."] },
    }
  }

  // 3. إدراج التقييم الجديد في قاعدة البيانات
  // ملاحظة: is_approved يتم تعيينها افتراضياً حسب إعدادات الجدول (true أو false للمراجعة الإدارية)
  const { data: insertedReview, error: insertError } = await supabase
    .from("product_reviews")
    .insert({
      product_id: productId,
      user_id: currentUser.id,
      rating,
      content: content?.trim() || null,
      is_approved: true, // أو false إذا كان يتطلب موافقة الإدارة مسبقاً
    })
    .select("id")
    .single()

  if (insertError || !insertedReview) {
    console.error("[createReview] Database insert failed", {
      productId,
      userId: currentUser.id,
      code: insertError?.code,
      message: insertError?.message,
    })
    return {
      success: false,
      error: "CREATE_REVIEW_ERROR",
      details: {
        database: [insertError?.message || "Failed to create review."],
      },
    }
  }

  revalidatePath("/", "layout")
  return { success: true, data: { id: insertedReview.id } }
}
