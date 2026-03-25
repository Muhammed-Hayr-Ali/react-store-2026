// ===============================================================================
// File Name: get-notifications.ts
// Description: Get user notifications
// Author: Mohammed Kher Ali
// Date: 2026-03-25
// Copyright (c) 2026 Mohammed Kher Ali
// ===============================================================================

"use server"

import { createServerClient } from "@/lib/supabase/createServerClient"
import { ApiResult } from "@/lib/types/common"

import type { Notification } from "@/components/notifications/types"

// ===============================================================================
// Types
// ===============================================================================

export interface GetNotificationsResult extends ApiResult<Notification[]> {
  error?: string
}

// ===============================================================================
// Get Notifications
// ===============================================================================

/**
 * جلب إشعارات المستخدم (آخر 20 إشعار)
 *
 * @returns قائمة الإشعارات
 */
export async function getNotifications(): Promise<GetNotificationsResult> {
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

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20)

    if (error) {
      console.error("Error fetching notifications:", error)
      return {
        success: false,
        error: "NOTIFICATIONS_FETCH_ERROR",
      }
    }

    return {
      success: true,
      data: data || [],
    }
  } catch (error) {
    console.error("Get notifications error:", error)
    return {
      success: false,
      error: "UNEXPECTED_ERROR",
    }
  }
}
