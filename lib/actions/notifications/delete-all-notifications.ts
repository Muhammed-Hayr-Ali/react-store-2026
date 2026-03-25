// ===============================================================================
// File Name: delete-all-notifications.ts
// Description: Delete all user notifications
// Author: Mohammed Kher Ali
// Date: 2026-03-25
// Copyright (c) 2026 Mohammed Kher Ali
// ===============================================================================

"use server"

import { createAdminClient } from "@/lib/supabase/createAdminClient "
import { ApiResult } from "@/lib/types/common"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

// ===============================================================================
// Types
// ===============================================================================

export interface DeleteAllNotificationsResult extends ApiResult {
  error?: string
}

// ===============================================================================
// Delete All Notifications
// ===============================================================================

/**
 * حذف جميع إشعارات المستخدم
 *
 * @returns نتيجة العملية
 */
export async function deleteAllNotifications(): Promise<DeleteAllNotificationsResult> {
  try {
    const supabase = await createAdminClient()
    const cookieStore = await cookies()
    const authToken = cookieStore.get("sb-access-token")?.value

    if (!authToken) {
      return {
        success: false,
        error: "USER_NOT_AUTHENTICATED",
      }
    }

    // الحصول على بيانات المستخدم من التوكن
    const { data: userData, error: userError } =
      await supabase.auth.getUser(authToken)

    if (userError || !userData.user) {
      return {
        success: false,
        error: "USER_NOT_AUTHENTICATED",
      }
    }

    const userId = userData.user.id

    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("user_id", userId)

    if (error) {
      console.error("Error deleting all notifications:", error)
      return {
        success: false,
        error: "NOTIFICATIONS_DELETE_ERROR",
      }
    }

    revalidatePath("/")
    return {
      success: true,
    }
  } catch (error) {
    console.error("Delete all notifications error:", error)
    return {
      success: false,
      error: "UNEXPECTED_ERROR",
    }
  }
}
