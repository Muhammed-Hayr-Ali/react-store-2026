"use server"

import { z } from "zod"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { Category, categorySchema } from "../types"

export async function getCategoryBySlug(
  slug: string
): Promise<ApiResult<Category | null>> {
  // 1. التحقق من نص الـ slug
  const slugValidation = z
    .string()
    .trim()
    .min(1, "SLUG_REQUIRED")
    .safeParse(slug)
  if (!slugValidation.success) {
    return {
      success: false,
      error: "INVALID_SLUG",
    }
  }

  // 2. تهيئة عميل Supabase
  const supabase = await createServerClient()

  // 3. جلب التصنيف بالـ slug
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slugValidation.data)
    .single()

  // 4. معالجة حالة عدم الوجود
  if (error && error.code === "PGRST116") {
    return { success: true, data: null }
  }

  if (error) {
    return {
      success: false,
      error: "FETCH_CATEGORY_BY_SLUG_ERROR",
      details: { database: [error.message] },
    }
  }

  // 5. التحقق من البيانات المرجعة
  const parsedData = categorySchema.safeParse(data)
  if (!parsedData.success) {
    console.error(
      "Database data mismatch in getCategoryBySlug:",
      parsedData.error
    )
    return {
      success: false,
      error: "DATA_VALIDATION_ERROR",
    }
  }

  return { success: true, data: parsedData.data }
}
