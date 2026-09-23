"use server"

import { z } from "zod"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { Brand, createBrandSchema, brandSchema } from "../types"
import { hasRole } from "../../role/role-checker"
import { hasPermission } from "../../role/permission-checker"

export async function createBrand(
  payload: unknown
): Promise<ApiResult<Brand | null>> {
  // 1. التحقق من صحة البيانات المدخلة باستخدام مخطط الإنشاء
  const validation = createBrandSchema.safeParse(payload)
  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: z.flattenError(validation.error).fieldErrors,
    }
  }

  // إنشاء بيانات آمنة بعد التحقق
  const safeData = validation.data

  // 2. تهيئة عميل Supabase
  const supabase = await createServerClient()

  // 3. التحقق من دور المستخدم (Admin)
  const has_role = await hasRole("admin")
  if (!has_role) {
    return {
      success: false,
      error: "UNAUTHORIZED_ACCESS",
    }
  }

  const has_permission = await hasPermission("create_brand")
  if (!has_permission) {
    return {
      success: false,
      error: "PERMISSION_DENIED",
    }
  }

  // 5. إدراج الفئة الجديدة في قاعدة البيانات
  const { data: newBrand, error } = await supabase
    .from("brands")
    .insert(safeData)
    .select()
    .single()

  if (error) {
    if (error.code === "23505") {
      return {
        success: false,
        error: "SLUG_ALREADY_EXISTS",
      }
    }

    return {
      success: false,
      error: "CREATE_BRAND_ERROR",
      details: { database: [error.message] },
    }
  }

  const parsedData = brandSchema.safeParse(newBrand)
  if (!parsedData.success) {
    console.error("Database data mismatch on create:", parsedData.error)
    return {
      success: false,
      error: "DATA_VALIDATION_ERROR",
    }
  }

  // 8. نجاح العملية
  return {
    success: true,
    data: parsedData.data,
  }
}
