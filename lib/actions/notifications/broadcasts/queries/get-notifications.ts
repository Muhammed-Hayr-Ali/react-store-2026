/**
 * @file lib/actions/notifications/broadcasts/queries/get-notifications.ts
 */

"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { NotificationRecord } from "../../types"

export async function getNotifications(): Promise<ApiResult<NotificationRecord[]>> {
  const supabase = await createServerClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { success: false, error: "UNAUTHORIZED" }
  }

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    return {
      success: false,
      error: "FETCH_NOTIFICATIONS_ERROR",
      details: { database: [error.message] },
    }
  }

  return { success: true, data: data as NotificationRecord[] }
}