"use server"

import { revalidatePath } from "next/cache"
import { ActionResponse } from "../types"
import { hasPermission, PERMISSIONS } from "../../role"
import { createAdminClient } from "@/lib/database/supabase/admin"
import { appRoutes } from "@/lib/config/app-routes"

export async function deleteUser(userId: string): Promise<ActionResponse> {
  try {
    // 1. التحقق من الصلاحيات
    const canDelete = await hasPermission(PERMISSIONS.DELETE_USER)
    if (!canDelete) {
      return {
        success: false,
        error: "PERMISSION_DENIED",
      }
    }

    const supabase = await createAdminClient()

    // 2. حذف المستخدم نهائياً من نظام المصادقة عبر Admin API
    const { error: authError } = await supabase.auth.admin.deleteUser(userId)

    if (authError) {
      console.error("Error deleting user from auth:", authError.message)
      return { success: false, error: authError.message }
    }

    // 3. حذف السجل من جدول الـ profiles
    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", userId)

    if (profileError) {
      console.error("Error deleting user profile:", profileError.message)
    }

    revalidatePath(appRoutes.dashboard.admin.users)
    return { success: true }
  } catch (err) {
    console.error("Unexpected error in deleteUser:", err)
    return {
      success: false,
      error: "An unexpected error occurred while deleting the user.",
    }
  }
}
