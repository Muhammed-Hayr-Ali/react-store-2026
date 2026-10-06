"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/database/supabase/admin"
import { ApiResult } from "@/lib/database/types/utils"
import { AdminUserSummary } from "../types"
import { createUserSchema } from "../schemas"
import { hasPermission, PERMISSIONS } from "../../role"

interface CreateUserParams {
  email: string
  password?: string
  firstName?: string
  lastName?: string
  phoneNumber?: string
}

export async function createUser(
  payload: unknown
): Promise<ApiResult<AdminUserSummary | null>> {
  // 1. التحقق من صحة المدخلات عبر Zod
  const validation = createUserSchema.safeParse(payload)
  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: validation.error.flatten().fieldErrors,
    }
  }

  const safeData = validation.data

  try {
    // 2. التحقق من الصلاحيات
    const canCreate = await hasPermission(PERMISSIONS.CREATE_USER)
    if (!canCreate) {
      return {
        success: false,
        error: "PERMISSION_DENIED",
      }
    }

    const supabase = createAdminClient()

    // 3. إنشاء المستخدم في النظام عبر Admin API
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: safeData.email,
        password: safeData.password || Math.random().toString(36).slice(-8),
        email_confirm: true,
        user_metadata: {
          first_name: safeData.firstName,
          last_name: safeData.lastName,
        },
      })

    if (authError || !authData.user) {
      console.error("Error creating user in auth:", authError?.message)

      // التحقق مما إذا كان الخطأ بسبب أن البريد الإلكتروني مستخدم مسبقاً
      const errorMsg = authError?.message?.toLowerCase() || ""
      if (
        errorMsg.includes("already registered") ||
        errorMsg.includes("already exists") ||
        errorMsg.includes("email_exists")
      ) {
        return {
          success: false,
          error: "EMAIL_ALREADY_EXISTS",
        }
      }

      return {
        success: false,
        error: "CREATE_USER_ERROR",
        details: { database: [authError?.message || "Failed to create user"] },
      }
    }

    const userId = authData.user.id

    // 4. حفظ بيانات الملف الشخصي في جدول profiles
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        email: safeData.email,
        first_name: safeData.firstName || null,
        last_name: safeData.lastName || null,
        phone_number: safeData.phoneNumber || null,
        status: "active",
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (profileError) {
      console.error("Error saving user profile:", profileError.message)
    }

    // 5. تجهيز كائن البيانات المُعاد للـ Frontend
    const newUserSummary: AdminUserSummary = {
      id: userId,
      email: authData.user.email || safeData.email,
      first_name: safeData.firstName || null,
      last_name: safeData.lastName || null,
      phone_number: safeData.phoneNumber || null,
      profile_image: profileData?.profile_image || null,
      status: "active",
      ban_reason: null,
      banned_at: null,
      created_at: authData.user.created_at || new Date().toISOString(),
      roles: [],
    }

    revalidatePath("/", "layout")
    return {
      success: true,
      data: newUserSummary,
    }
  } catch (err) {
    console.error("Unexpected error in createUser:", err)
    return {
      success: false,
      error: "An unexpected error occurred while creating the user.",
    }
  }
}
