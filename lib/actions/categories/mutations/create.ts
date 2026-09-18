"use server"

import { z } from "zod"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { Category, createCategorySchema, categorySchema } from "../types"
import { hasRole } from "../../role/role-checker"
import { hasPermission } from "../../role/permission-checker"

export async function createCategory(
  payload: unknown
): Promise<ApiResult<Category | null>> {
  // 1. التحقق من صحة البيانات المدخلة باستخدام مخطط الإنشاء
  const validation = createCategorySchema.safeParse(payload)
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

  // 4. التحقق من صلاحية "إنشاء" فئة (تم التغيير من update_category إلى create_category)
  const has_permission = await hasPermission("create_category")
  if (!has_permission) {
    return {
      success: false,
      error: "PERMISSION_DENIED",
    }
  }

  // 5. إدراج الفئة الجديدة في قاعدة البيانات
  const { data: newCategory, error } = await supabase
    .from("categories")
    .insert(safeData) // تم التغيير من update إلى insert
    .select()
    .single()

  // 6. معالجة الأخطاء المحتملة من قاعدة البيانات
  if (error) {
    // كود 23505 يشير إلى انتهاك قيد التفرد (Unique Violation)، مثل تكرار الـ slug
    if (error.code === "23505") {
      return {
        success: false,
        error: "SLUG_ALREADY_EXISTS",
      }
    }

    // معالجة أي أخطاء أخرى غير متوقعة
    return {
      success: false,
      error: "CREATE_CATEGORY_ERROR",
      details: { database: [error.message] },
    }
  }

  // 7. التحقق من تطابق البيانات المرجعة من قاعدة البيانات مع المخطط الأساسي
  const parsedData = categorySchema.safeParse(newCategory)
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
