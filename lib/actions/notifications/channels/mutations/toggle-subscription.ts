/**
 * @file lib/actions/notifications/channels/mutations/toggle-subscription.ts
 * @description Server Action to toggle a user's subscription preference for a specific notification channel.
 * Enforces Zod schema parsing, authentication verification, mandatory guard checks, and cache revalidation.
 */

"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { toggleSubscriptionSchema } from "../../schemas"

// ============================================================================
// Main Action Function
// ============================================================================

export async function toggleChannelSubscription(
  payload: unknown
): Promise<ApiResult<boolean>> {
  // 1. Validate payload against Zod schema
  const validation = toggleSubscriptionSchema.safeParse(payload)
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

  const { channelId, isSubscribed } = validation.data

  // 2. Initialize Supabase client
  const supabase = await createServerClient()

  // 3. Authenticate current user session
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return {
      success: false,
      error: "UNAUTHORIZED_ACCESS",
    }
  }

  // 4. Verify channel existence and validate mandatory rule
  const { data: channel, error: chError } = await supabase
    .from("notification_channels")
    .select("is_mandatory")
    .eq("id", channelId)
    .single()

  if (chError) {
    if (chError.code === "PGRST116") {
      return {
        success: false,
        error: "CHANNEL_NOT_FOUND",
      }
    }

    return {
      success: false,
      error: "FETCH_CHANNEL_ERROR",
      details: { database: [chError.message] },
    }
  }

  if (channel.is_mandatory && !isSubscribed) {
    return {
      success: false,
      error: "CANNOT_UNSUBSCRIBE_MANDATORY_CHANNEL",
    }
  }

  // 5. Upsert subscription preference record
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

  // 6. Invalidate stale cache paths
  revalidatePath("/", "layout")

  return {
    success: true,
    data: isSubscribed,
  }
}
