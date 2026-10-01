"use server"

import { z } from "zod"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { Category, categorySchema } from "../types"

export async function getCategoryById(
  id: string
): Promise<ApiResult<Category | null>> {
  // 1. التحقق من صحة الـ UUID
  const idValidation = z.string().uuid("INVALID_ID").safeParse(id)
  if (!idValidation.success) {
    return {
      success: false,
      error: "INVALID_ID",
    }
  }

  // 2. تهيئة عميل Supabase
  const supabase = await createServerClient()

  // 3. جلب التصنيف بالمعرف
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .single()

  // 4. معالجة حالة عدم الوجود بسلاسة
  if (error && error.code === "PGRST116") {
    return { success: true, data: null }
  }

  if (error) {
    return {
      success: false,
      error: "FETCH_CATEGORY_BY_ID_ERROR",
      details: { database: [error.message] },
    }
  }

  // 5. التحقق من مطابقة البيانات مع المخطط
  const parsedData = categorySchema.safeParse(data)
  if (!parsedData.success) {
    console.error(
      "Database data mismatch in getCategoryById:",
      parsedData.error
    )
    return {
      success: false,
      error: "DATA_VALIDATION_ERROR",
    }
  }

  return { success: true, data: parsedData.data }
}
