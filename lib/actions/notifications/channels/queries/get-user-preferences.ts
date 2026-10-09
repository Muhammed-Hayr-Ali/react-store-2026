/**
 * @file lib/actions/notifications/channels/queries/get-user-preferences.ts
 */

"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { UserChannelPreference } from "../../types"

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

  const { data: channels, error: channelsError } = await supabase
    .from("notification_channels")
    .select("id, name, name_ar, description, description_ar, is_mandatory, default_enabled")
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

  const preferences: UserChannelPreference[] = channels.map((c) => {
    let isSubscribed = c.default_enabled
    if (subsMap.has(c.id)) {
      isSubscribed = subsMap.get(c.id)!
    }
    if (c.is_mandatory) {
      isSubscribed = true
    }

    return {
      id: c.id,
      name: c.name,
      name_ar: c.name_ar,
      description: c.description,
      description_ar: c.description_ar,
      is_mandatory: c.is_mandatory,
      is_subscribed: isSubscribed,
    }
  })

  return { success: true, data: preferences }
}