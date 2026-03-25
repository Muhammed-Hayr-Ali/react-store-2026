// ===============================================================================
// File Name: mark-all-as-read.ts
// Description: Mark all user notifications as read
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

export interface MarkAllAsReadResult extends ApiResult {
  error?: string
}

// ===============================================================================
// Mark All As Read
// ===============================================================================

/**
 * تحديد جميع إشعارات المستخدم كمقروءة
 *
 * @returns نتيجة العملية
 */
export async function markAllAsRead(): Promise<MarkAllAsReadResult> {
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
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false)

    if (error) {
      console.error("Error marking all notifications as read:", error)
      return {
        success: false,
        error: "NOTIFICATIONS_UPDATE_ERROR",
      }
    }

    revalidatePath("/")
    return {
      success: true,
    }
  } catch (error) {
    console.error("Mark all as read error:", error)
    return {
      success: false,
      error: "UNEXPECTED_ERROR",
    }
  }
}
