/**
 * @file lib/actions/notifications/channels/queries/get-active-channels.ts
 */

"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { NotificationChannelRecord } from "../../types"

/**
 * جلب كافة القنوات (النشطة والمعطلة) للوحة تحكم الإدارة
 */
export async function getAllNotificationChannels(): Promise<
  ApiResult<NotificationChannelRecord[]>
> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("notification_channels")
    .select("*")
    .order("is_mandatory", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) {
    return {
      success: false,
      error: "FETCH_CHANNELS_ERROR",
      details: { database: [error.message] },
    }
  }

  return { success: true, data: data as NotificationChannelRecord[] }
}

/**
 * جلب القنوات النشطة فقط للاشتراكات والواجهة العامة
 */
export async function getActiveNotificationChannels(): Promise<
  ApiResult<NotificationChannelRecord[]>
> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("notification_channels")
    .select("*")
    .eq("is_active", true)
    .order("is_mandatory", { ascending: false })
    .order("name", { ascending: true })

  if (error) {
    return {
      success: false,
      error: "FETCH_CHANNELS_ERROR",
      details: { database: [error.message] },
    }
  }

  return { success: true, data: data as NotificationChannelRecord[] }
}
