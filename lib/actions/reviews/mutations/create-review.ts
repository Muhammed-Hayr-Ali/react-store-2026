/**
 * @file lib/actions/reviews/mutations/create-review.ts
 * @description Creates a new product review from the storefront.
 */

"use server"

import { revalidatePath } from "next/cache"

import type { ApiResult } from "@/lib/actions/types/utils"
import { createServerClient } from "@/lib/database/supabase/server"

import { getValidationDetails } from "../../validation"
import { createReviewSchema, type CreateReviewInput } from "../schemas"
import type { ProductReview } from "../types"

export async function createReview(
  input: CreateReviewInput
): Promise<ApiResult<ProductReview>> {
  
  // 1. التحقق من صحة البيانات باستخدام المخطط الجديد
  const validation = createReviewSchema.safeParse(input)
  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: getValidationDetails(validation.error),
    }
  }

  const supabase = await createServerClient()
  
  // 2. محاولة جلب المستخدم الحالي (إذا كان مسجلاً للدخول في المتجر)
  const { data: authData } = await supabase.auth.getUser()
  const userId = authData?.user?.id || null

  // 3. إدخال التعليق في قاعدة البيانات
  const { data, error } = await supabase
    .from("product_reviews")
    .insert({
      product_id: validation.data.product_id,
      rating: validation.data.rating,
      content: validation.data.content,
      user_id: userId,
      is_approved: false, // التعليقات الجديدة تحتاج لموافقة المشرف افتراضياً
    })
    .select("*")
    .single()

  if (error) {
    return {
      success: false,
      error: "CREATE_REVIEW_ERROR",
      details: { database: [error.message] },
    }
  }

  // 4. تحديث الكاش ليظهر التعليق في لوحة التحكم فوراً للمراجعة
  revalidatePath("/", "layout")
  return { success: true, data: data as ProductReview }
}