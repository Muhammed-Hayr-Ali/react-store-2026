"use server"

import { z } from "zod"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { Category, categorySchema } from "../types"

export async function getAllCategories({
  parentId,
  activeOnly = true,
}: {
  parentId?: string | null
  activeOnly?: boolean
} = {}): Promise<ApiResult<Category[]>> {
  // 1. التحقق من parentId إذا تم تمريره كنص
  if (parentId !== undefined && parentId !== null) {
    const parentValidation = z
      .string()
      .uuid("INVALID_PARENT_ID")
      .safeParse(parentId)
    if (!parentValidation.success) {
      return {
        success: false,
        error: "INVALID_PARENT_ID",
      }
    }
  }

  // 2. تهيئة عميل Supabase
  const supabase = await createServerClient()

  // 3. بناء الاستعلام مع الترتيب الافتراضي
  let query = supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true })

  // 4. تطبيق الفلاتر
  if (parentId !== undefined) {
    if (parentId === null) {
      query = query.is("parent_id", null)
    } else {
      query = query.eq("parent_id", parentId)
    }
  }

  if (activeOnly) {
    query = query.eq("is_active", true)
  }

  const { data, error } = await query

  if (error) {
    return {
      success: false,
      error: "FETCH_CATEGORIES_ERROR",
      details: { database: [error.message] },
    }
  }

  // 5. التحقق من مصفوفة البيانات عبر Zod
  const parsedData = z.array(categorySchema).safeParse(data ?? [])
  if (!parsedData.success) {
    console.error(
      "Database data mismatch in getAllCategories:",
      parsedData.error
    )
    return {
      success: false,
      error: "DATA_VALIDATION_ERROR",
    }
  }

  return { success: true, data: parsedData.data }
}
