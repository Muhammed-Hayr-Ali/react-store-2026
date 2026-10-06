"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/database/supabase/server"
import { ActionResponse } from "../types"
import { hasPermission, PERMISSIONS } from "../../role"
import { appRoutes } from "@/lib/config/app-routes"

interface UpdateUserParams {
  userId: string
  firstName?: string
  lastName?: string
  phoneNumber?: string
}

export async function updateUser(
  params: UpdateUserParams
): Promise<ActionResponse> {
  try {
    // 1. التحقق من الصلاحيات
    const canUpdate = await hasPermission(PERMISSIONS.UPDATE_USER)
    if (!canUpdate) {
      return {
        success: false,
        error: "PERMISSION_DENIED",
      }
    }

    const supabase = await createClient()

    // 2. تحديث بيانات الملف الشخصي في جدول profiles
    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: params.firstName?.trim() || null,
        last_name: params.lastName?.trim() || null,
        phone_number: params.phoneNumber?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.userId)

    if (error) {
      console.error("Error updating user:", error.message)
      return { success: false, error: error.message }
    }

    revalidatePath(appRoutes.dashboard.admin.users)
    return { success: true }
  } catch (err) {
    console.error("Unexpected error in updateUser:", err)
    return {
      success: false,
      error: "An unexpected error occurred while updating the user.",
    }
  }
}
