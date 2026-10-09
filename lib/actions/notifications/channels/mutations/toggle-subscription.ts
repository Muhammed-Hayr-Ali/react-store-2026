/**
 * @file lib/actions/notifications/channels/mutations/toggle-subscription.ts
 */

"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"

const toggleSubscriptionSchema = z.object({
  channelId: z.string().uuid("INVALID_CHANNEL_ID"),
  isSubscribed: z.boolean(),
})

export async function toggleChannelSubscription(
  channelId: string,
  isSubscribed: boolean
): Promise<ApiResult<boolean>> {
  const validation = toggleSubscriptionSchema.safeParse({ channelId, isSubscribed })
  if (!validation.success) {
    const fieldErrors: Record<string, string[]> = {}
    for (const issue of validation.error.issues) {
      const path = issue.path.join(".")
      if (!fieldErrors[path]) fieldErrors[path] = []
      fieldErrors[path].push(issue.message)
    }
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: fieldErrors,
    }
  }

  const supabase = await createServerClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { success: false, error: "UNAUTHORIZED_ACCESS" }
  }

  const { data: channel, error: chError } = await supabase
    .from("notification_channels")
    .select("is_mandatory")
    .eq("id", validation.data.channelId)
    .single()

  if (chError || !channel) {
    return { success: false, error: "CHANNEL_NOT_FOUND" }
  }

  if (channel.is_mandatory && !validation.data.isSubscribed) {
    return { success: false, error: "CANNOT_UNSUBSCRIBE_MANDATORY_CHANNEL" }
  }

  const { error: upsertError } = await supabase
    .from("user_channel_subscriptions")
    .upsert(
      {
        user_id: user.id,
        channel_id: validation.data.channelId,
        is_subscribed: validation.data.isSubscribed,
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

  return {
    success: true,
    data: validation.data.isSubscribed,
  }
}