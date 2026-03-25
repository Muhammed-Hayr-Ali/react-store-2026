// ===============================================================================
// File Name: delete-all-notifications.ts
// Description: Delete all user notifications
// Author: Mohammed Kher Ali
// Date: 2026-03-25
// Copyright (c) 2026 Mohammed Kher Ali
// ===============================================================================

"use server"

import { createServerClient } from "@/lib/supabase/createServerClient"
import { ApiResult } from "@/lib/types/common"
import { revalidatePath } from "next/cache"

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
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        error: "USER_NOT_AUTHENTICATED",
      }
    }

    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("user_id", user.id)

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
