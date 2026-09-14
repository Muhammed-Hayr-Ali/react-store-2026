"use server"

/**
 * @file Server Action for creating a new product category (Admin only).
 */
import { z } from "zod" // تأكد من استيراد z

import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
// ✅ أضفنا categorySchema للتحقق من البيانات العائدة من قاعدة البيانات
import { Category, createCategorySchema, categorySchema } from "./types"
import { hasRole } from "../role/role-checker"
import { hasPermission } from "../role/permission-checker"


export async function createCategory(
  // ✅ استخدام unknown هنا هو الأفضل أمنياً، لأننا سنقوم بالتحقق منها فوراً
  payload: unknown
): Promise<ApiResult<Category | null>> {
  // 1. التحقق الأمني الإلزامي من البيانات الداخلة
  const validation = createCategorySchema.safeParse(payload)
  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: z.flattenError(validation.error).fieldErrors,
    }
  }

  const safeData = validation.data

  // 2. إنشاء عميل Supabase
  const supabase = await createServerClient()

  // 3. التحقق من هوية المستخدم
  const has_role = await hasRole("admin")
  if (!has_role) {
    return {
      success: false,
      error: "UNAUTHORIZED_ACCESS",
    }
  }

  // 4. التحقق من الصلاحية الدقيقة
  const has_permission = await hasPermission("create_category")
  if (!has_permission) {
    return {
      success: false,
      error: "PERMISSION_DENIED",
    }
  }

  // 5. محاولة الإدراج في قاعدة البيانات
  const { data, error } = await supabase
    .from("categories")
    .insert(safeData)
    .select()
    .single()

  // 6. معالجة أخطاء قاعدة البيانات بذكاء
  if (error) {
    // ✅ كود 23505 في PostgreSQL يعني انتهاك قيد التفرد (Unique Violation)
    // هذا يحدث غالباً عند محاولة استخدام slug موجود مسبقاً
    if (error.code === "23505") {
      return {
        success: false,
        error: "SLUG_ALREADY_EXISTS",
      }
    }

    return {
      success: false,
      error: "CREATE_CATEGORY_ERROR",
      details: {
        error: [error.message],
      },
    }
  }

  // 7. ✅ التحقق من صحة البيانات العائدة من قاعدة البيانات (Defense in Depth)
  const parsedData = categorySchema.safeParse(data)
  if (!parsedData.success) {
    console.error("Database data mismatch:", parsedData.error)
    return {
      success: false,
      error: "DATA_VALIDATION_ERROR",
    }
  }

  // 8. النجاح
  return {
    success: true,
    data: parsedData.data,
  }
}
