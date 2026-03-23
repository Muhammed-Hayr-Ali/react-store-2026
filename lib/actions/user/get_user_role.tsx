"use server"

import { createServerClient } from "@/lib/supabase/createServerClient"
import { i } from "motion/react-client"
// {
// "is_active": true,
// "granted_by": "5ad15737-19ac-4716-b804-45b598ff2822",
// "roles": {
// "id": "857ceec0-3010-4f36-a48c-9898acc14b4f",
// "name": "customer"
// }
// }

type StructuredRole = {
  is_active: boolean
  granted_by: string
  roles: {
    id: string
    name: string
  }

}

type Role = {
  is_active: boolean
  granted_by: string
  roles: {
    id: string
    name: string
  }
}

export async function getUserRole() {
  const supabase = await createServerClient()

  // 1. التحقق من هوية المستخدم (مهم جداً في السيرفر)
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    console.warn("⚠️ No authenticated user found:", authError?.message)
    return null
  }

  // 2. الاستعلام مع الربط (Join) وجلب دور واحد نشط فقط
  // ملاحظة: في السيرفر نستخدم .single() لأننا نتوقع دوراً واحداً لكل مستخدم
  const { data: roleData, error: queryError } = await supabase
    .from("profile_roles")
    .select(
      `
      is_active,
      granted_by,
      roles:role_id (
      id,
      name      
      )
    `
    )
    .eq("user_id", user.id)
    .eq("is_active", true) // جلب الأدوار النشطة فقط
    .single() // إرجاع null إذا لم يوجد دور (أكثر أماناً من .single() التي ترمي خطأ)

  // 3. معالجة الأخطاء
  if (queryError) {
    console.error("❌ Database Error:", {
      code: queryError.code,
      message: queryError.message,
      hint: queryError.hint,
      details: queryError.details,
    })

    return null
  }

  const role: StructuredRole = roleData as unknown as StructuredRole



  return {
    id: role.roles.id,
    role: role.roles.name,
    isActive: role.is_active,
    grantedBy: role.granted_by,
  }
}
