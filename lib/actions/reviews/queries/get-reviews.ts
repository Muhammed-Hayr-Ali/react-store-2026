/**
 * @file lib/actions/reviews/queries/get-reviews.ts
 * @description Retrieves reviews in display order with optional management filters.
 */

"use server"

import type { ApiResult } from "@/lib/actions/types/utils"
import { createServerClient } from "@/lib/database/supabase/server"

import { hasPermission, PERMISSIONS } from "../../role"
import { getValidationDetails } from "../../validation"
import { getReviewsSchema, type GetReviewsInput } from "../schemas"
import type { ReviewWithUser } from "../types"

export async function getReviews(
  input: GetReviewsInput = {}
): Promise<ApiResult<ReviewWithUser[]>> {
  const validation = getReviewsSchema.safeParse(input)
  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: getValidationDetails(validation.error),
    }
  }

  const { includePending, productId } = validation.data
  
  if (includePending) {
    const canViewManagement = await hasPermission(PERMISSIONS.VIEW_REVIEWS_MANAGEMENT)
    if (!canViewManagement) {
      return { success: false, error: "PERMISSION_DENIED" }
    }
  }

  const supabase = await createServerClient()
  
  // تعديل الأعمدة المطلوبة لتطابق جدول profiles في قاعدة البيانات
  let query = supabase
    .from("product_reviews")
    .select(`
      *,
      user:user_id (
        first_name,
        last_name,
        profile_image
      )
    `)
    .order("created_at", { ascending: false })

  if (!includePending) {
    query = query.eq("is_approved", true)
  }

  if (productId) {
    query = query.eq("product_id", productId)
  }

  const { data, error } = await query
  if (error) {
    return {
      success: false,
      error: "GET_REVIEWS_ERROR",
      details: { database: [error.message] },
    }
  }

  return { success: true, data: (data ?? []) as ReviewWithUser[] }
}