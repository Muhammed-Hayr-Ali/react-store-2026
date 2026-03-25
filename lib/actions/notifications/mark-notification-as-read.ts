// ===============================================================================
// File Name: mark-notification-as-read.ts
// Description: Mark a single notification as read
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

export interface MarkNotificationAsReadResult extends ApiResult {
  error?: string
}

// ===============================================================================
// Mark Notification As Read
// ===============================================================================

/**
 * تحديد إشعار كمقروء
 *
 * @param id معرف الإشعار
 * @returns نتيجة العملية
 */
export async function markNotificationAsRead(
  id: string
): Promise<MarkNotificationAsReadResult> {
  try {
    const supabase = await createServerClient()

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id)

    if (error) {
      console.error("Error marking notification as read:", error)
      return {
        success: false,
        error: "NOTIFICATION_UPDATE_ERROR",
      }
    }

    revalidatePath("/")
    return {
      success: true,
    }
  } catch (error) {
    console.error("Mark notification as read error:", error)
    return {
      success: false,
      error: "UNEXPECTED_ERROR",
    }
  }
}
