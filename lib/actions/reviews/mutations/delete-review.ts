/**
 * @file lib/actions/reviews/mutations/delete-review.ts
 * @description Deletes a product review after checking permissions.
 */

"use server"

import { revalidatePath } from "next/cache"

import type { ApiResult } from "@/lib/actions/types/utils"
import { createServerClient } from "@/lib/database/supabase/server"

import { hasPermission, PERMISSIONS } from "../../role"

export async function deleteReview(id: string): Promise<ApiResult<null>> {
  // 1. التحقق من الصلاحيات (يجب أن يكون المشرف قادراً على الحذف)
  const canDelete = await hasPermission(PERMISSIONS.DELETE_REVIEW)
  if (!canDelete) {
    return { success: false, error: "PERMISSION_DENIED" }
  }

  if (!id) {
    return { success: false, error: "VALIDATION_ERROR" }
  }

  const supabase = await createServerClient()

  // 2. حذف التعليق
  const { error } = await supabase
    .from("product_reviews")
    .delete()
    .eq("id", id)

  if (error) {
    return {
      success: false,
      error: "DELETE_REVIEW_ERROR",
      details: { database: [error.message] },
    }
  }

  // 3. تحديث الكاش لتختفي المراجعة من المتجر ولوحة التحكم
  revalidatePath("/", "layout")
  
  return { success: true, data: null }
}