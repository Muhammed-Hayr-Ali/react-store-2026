/**
 * @file lib/actions/notifications/queries/get-admin-notifications.ts
 */

"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { AdminNotificationRecord } from "../types"

export async function getAdminNotifications(): Promise<
  ApiResult<AdminNotificationRecord[]>
> {
  const supabase = await createServerClient()

  const { data: notifications, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    return {
      success: false,
      error: "FETCH_ADMIN_NOTIFICATIONS_ERROR",
      details: { database: [error.message] },
    }
  }

  if (!notifications || notifications.length === 0) {
    return { success: true, data: [] }
  }

  const userIds = Array.from(new Set(notifications.map((n) => n.user_id)))

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, email, profile_image")
    .in("id", userIds)

  const profilesMap = new Map(profiles?.map((p) => [p.id, p]) || [])

  const enrichedNotifications = notifications.map((notification) => ({
    ...notification,
    profiles: profilesMap.get(notification.user_id) || null,
  }))

  return {
    success: true,
    data: enrichedNotifications as AdminNotificationRecord[],
  }
}
