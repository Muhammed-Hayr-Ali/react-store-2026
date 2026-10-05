"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/database/supabase/server"
import { ActionResponse } from "../types"
import { hasPermission, PERMISSIONS } from "../../role"

interface CreateUserParams {
  email: string
  password?: string
  firstName?: string
  lastName?: string
  phoneNumber?: string
}

export async function createUser(
  params: CreateUserParams
): Promise<ActionResponse> {
  try {
    // 1. التحقق من الصلاحيات
    const canCreate = await hasPermission(PERMISSIONS.CREATE_USER)
    if (!canCreate) {
      return {
        success: false,
        error: "PERMISSION_DENIED",
      }
    }

    const supabase = await createClient()

    // 2. إنشاء المستخدم في النظام عبر Admin API
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: params.email,
        password: params.password || Math.random().toString(36).slice(-8),
        email_confirm: true,
      })

    if (authError || !authData.user) {
      console.error("Error creating user in auth:", authError?.message)
      return {
        success: false,
        error: authError?.message || "Failed to create user",
      }
    }

    // 3. تحديث بيانات الملف الشخصي في جدول profiles
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        first_name: params.firstName?.trim() || null,
        last_name: params.lastName?.trim() || null,
        phone_number: params.phoneNumber?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", authData.user.id)

    if (profileError) {
      console.error("Error updating user profile:", profileError.message)
    }

    revalidatePath("/dashboard/users")
    return { success: true }
  } catch (err) {
    console.error("Unexpected error in createUser:", err)
    return {
      success: false,
      error: "An unexpected error occurred while creating the user.",
    }
  }
}
