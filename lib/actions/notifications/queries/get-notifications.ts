/**
 * @file lib/actions/notifications/queries/get-notifications.ts
 */

"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { NotificationRecord } from "../types"

export async function getNotifications(): Promise<
  ApiResult<{ notifications: NotificationRecord[]; unreadCount: number }>
> {
  const supabase = await createServerClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { success: false, error: "UNAUTHORIZED_ACCESS" }
  }

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(30)

  if (error) {
    return {
      success: false,
      error: "FETCH_NOTIFICATIONS_ERROR",
      details: { database: [error.message] },
    }
  }

  const notifications = (data as NotificationRecord[]) || []
  const unreadCount = notifications.filter((n) => !n.is_read).length

  return {
    success: true,
    data: {
      notifications,
      unreadCount,
    },
  }
}
