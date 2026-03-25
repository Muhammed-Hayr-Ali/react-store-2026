// ===============================================================================
// File Name: delete-read-notifications.ts
// Description: Delete read notifications only
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

export interface DeleteReadNotificationsResult extends ApiResult {
  error?: string
}

// ===============================================================================
// Delete Read Notifications
// ===============================================================================

/**
 * حذف الإشعارات المقروءة فقط
 *
 * @returns نتيجة العملية
 */
export async function deleteReadNotifications(): Promise<DeleteReadNotificationsResult> {
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
      .eq("is_read", true)

    if (error) {
      console.error("Error deleting read notifications:", error)
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
    console.error("Delete read notifications error:", error)
    return {
      success: false,
      error: "UNEXPECTED_ERROR",
    }
  }
}
