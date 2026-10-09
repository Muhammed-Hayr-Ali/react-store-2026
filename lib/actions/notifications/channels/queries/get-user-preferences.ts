/**
 * @file lib/actions/notifications/channels/queries/get-user-preferences.ts
 */

"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { NotificationChannelRecord, UserChannelPreference } from "../../types"

export async function getUserChannelPreferences(): Promise<
  ApiResult<UserChannelPreference[]>
> {
  const supabase = await createServerClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { success: false, error: "UNAUTHORIZED" }
  }

  // جلب كافة حقول القناة لتطابق واجهة NotificationChannelRecord
  const { data: channels, error: channelsError } = await supabase
    .from("notification_channels")
    .select("*")
    .eq("is_active", true)
    .order("is_mandatory", { ascending: false })

  if (channelsError) {
    return {
      success: false,
      error: "FETCH_CHANNELS_ERROR",
      details: { database: [channelsError.message] },
    }
  }

  const { data: subs, error: subsError } = await supabase
    .from("user_channel_subscriptions")
    .select("channel_id, is_subscribed")
    .eq("user_id", user.id)

  if (subsError) {
    return {
      success: false,
      error: "FETCH_SUBSCRIPTIONS_ERROR",
      details: { database: [subsError.message] },
    }
  }

  const subsMap = new Map(subs.map((s) => [s.channel_id, s.is_subscribed]))

  const rawChannels = (channels as NotificationChannelRecord[]) || []

  const preferences: UserChannelPreference[] = rawChannels.map((c) => {
    let isSubscribed = c.default_enabled
    if (subsMap.has(c.id)) {
      isSubscribed = subsMap.get(c.id)!
    }
    if (c.is_mandatory) {
      isSubscribed = true
    }

    return {
      ...c,
      is_subscribed: isSubscribed,
    }
  })

  return { success: true, data: preferences }
}
