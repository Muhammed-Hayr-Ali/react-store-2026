/**
 * @file lib/actions/notifications/channels/queries/get-active-channels.ts
 */

"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { NotificationChannelRecord } from "../../types"

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