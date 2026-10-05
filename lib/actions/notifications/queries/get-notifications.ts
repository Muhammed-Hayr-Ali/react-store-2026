"use server"

import { createClient } from "@/lib/database/supabase/server"
import { GetNotificationsResponse, NotificationRecord } from "../types"

export async function getNotifications(): Promise<GetNotificationsResponse> {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { success: false, error: "Unauthorized" }
  }

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(30)

  if (error) {
    return { success: false, error: error.message }
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
