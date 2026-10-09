/**
 * @file lib/actions/notifications/mutations/toggle-channel-subscription.ts
 */

"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"

export async function toggleChannelSubscription(
  channelId: string,
  isSubscribed: boolean
): Promise<ApiResult<boolean>> {
  const idValidation = z
    .string()
    .uuid("INVALID_CHANNEL_ID")
    .safeParse(channelId)
  if (!idValidation.success) {
    return { success: false, error: "INVALID_CHANNEL_ID" }
  }

  const supabase = await createServerClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { success: false, error: "UNAUTHORIZED" }
  }

  // التحقق من أن القناة ليست إلزامية
  const { data: channel, error: chError } = await supabase
    .from("notification_channels")
    .select("is_mandatory")
    .eq("id", channelId)
    .single()

  if (chError || !channel) {
    return { success: false, error: "CHANNEL_NOT_FOUND" }
  }

  if (channel.is_mandatory && !isSubscribed) {
    return { success: false, error: "CANNOT_UNSUBSCRIBE_MANDATORY_CHANNEL" }
  }

  const { error: upsertError } = await supabase
    .from("user_channel_subscriptions")
    .upsert(
      {
        user_id: user.id,
        channel_id: channelId,
        is_subscribed: isSubscribed,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,channel_id" }
    )

  if (upsertError) {
    return {
      success: false,
      error: "UPDATE_SUBSCRIPTION_ERROR",
      details: { database: [upsertError.message] },
    }
  }

  revalidatePath("/", "layout")
  return { success: true, data: isSubscribed }
}
