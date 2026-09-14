"use server"

/**
 * @file Server Action for updating an existing product category (Admin only).
 */
import { z } from "zod"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
// ✅ استيراد المخططات للتحقق من البيانات الداخلة والخارجة
import { Category, updateCategorySchema, categorySchema } from "./types"
import { hasRole } from "../role/role-checker"
import { hasPermission } from "../role/permission-checker"


export async function updateCategory(
  id: string,
  payload: unknown // ✅ استخدام unknown لفرض التحقق الأمني أولاً
): Promise<ApiResult<Category | null>> {
  // 1. التحقق الأمني الإلزامي من المعرف (ID)
  const idValidation = z.uuid({ error: "invalid_id_format" }).safeParse(id)
  if (!idValidation.success) {
    return {
      success: false,
      error: "INVALID_ID",
    }
  }

  // 2. التحقق الأمني الإلزامي من بيانات التحديث
  const validation = updateCategorySchema.safeParse(payload)
  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: z.flattenError(validation.error).fieldErrors,
    }
  }

  const safeData = validation.data

  // 3. إنشاء عميل Supabase
  const supabase = await createServerClient()


  



  


  const has_role = await hasRole("admin")
  if (!has_role) {
    return {
      success: false,
      error: "UNAUTHORIZED_ACCESS",
    }
  }

  const has_permission = await hasPermission("update_category")
  if (!has_permission) {
    return {
      success: false,
      error: "PERMISSION_DENIED",
    }
  }





  // 6. محاولة التحديث في قاعدة البيانات
  const { data: updatedCategory, error } = await supabase
    .from("categories")
    .update(safeData)
    .eq("id", id)
    .select()
    .single()

  // 7. معالجة أخطاء قاعدة البيانات بذكاء
  if (error) {
    // ✅ كود 23505: انتهاك قيد التفرد (Unique Violation)
    if (error.code === "23505") {
      return {
        success: false,
        error: "SLUG_ALREADY_EXISTS",
      }
    }

    // ✅ كود PGRST116: الصف غير موجود (عند استخدام .single() ولم يجد تطابقاً)
    if (error.code === "PGRST116") {
      return {
        success: false,
        error: "CATEGORY_NOT_FOUND",
      }
    }

    // ✅ أخطاء قاعدة البيانات الأخرى
    return {
      success: false,
      error: "UPDATE_CATEGORY_ERROR",
      details: { database: [error.message] },
    }
  }

  // 8. ✅ التحقق من صحة البيانات العائدة من قاعدة البيانات (Defense in Depth)
  const parsedData = categorySchema.safeParse(updatedCategory)
  if (!parsedData.success) {
    console.error("Database data mismatch on update:", parsedData.error)
    return {
      success: false,
      error: "DATA_VALIDATION_ERROR",
    }
  }

  // 9. النجاح
  return {
    success: true,
    data: parsedData.data,
  }
}
