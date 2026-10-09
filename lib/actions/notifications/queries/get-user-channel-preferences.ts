/**
 * @file lib/actions/notifications/queries/get-user-channel-preferences.ts
 */

"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { UserChannelPreference } from "../types"

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

  // 1. جلب القنوات النشطة في المتجر
  const { data: channels, error: channelsError } = await supabase
    .from("notification_channels")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: true })

  if (channelsError) {
    return {
      success: false,
      error: "FETCH_CHANNELS_ERROR",
      details: { database: [channelsError.message] },
    }
  }

  // 2. جلب اشتراكات المستخدم الحالية
  const { data: subscriptions, error: subsError } = await supabase
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

  const subMap = new Map<string, boolean>(
    subscriptions?.map((s) => [s.channel_id, s.is_subscribed]) || []
  )

  const preferences: UserChannelPreference[] = (channels || []).map((ch) => ({
    ...ch,
    is_subscribed: ch.is_mandatory
      ? true
      : subMap.has(ch.id)
        ? Boolean(subMap.get(ch.id))
        : ch.default_enabled,
  }))

  return {
    success: true,
    data: preferences,
  }
}
