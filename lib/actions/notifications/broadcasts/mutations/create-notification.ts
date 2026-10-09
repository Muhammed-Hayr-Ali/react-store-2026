/**
 * @file lib/actions/notifications/broadcasts/mutations/create-notification.ts
 * @description Server Actions to insert single notifications or broadcast to groups via Supabase.
 * Enforces Zod schema parsing, permission verification, entity validation, and cache revalidation.
 */

"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { BatchCountResult, NotificationRecord } from "../../types"
import {
  createNotificationSchema,
  broadcastNotificationSchema,
  notificationRecordSchema,
} from "../../schemas"
import { hasPermission, PERMISSIONS } from "../../../role"

// ============================================================================
// Single Notification Action
// ============================================================================

export async function createNotification(
  payload: unknown
): Promise<ApiResult<NotificationRecord | null>> {
  // 1. Validate payload against Zod schema
  const validation = createNotificationSchema.safeParse(payload)
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

  const safeData = validation.data

  // 2. Perform permission check
  const canCreate = await hasPermission(PERMISSIONS.CREATE_NOTIFICATION)
  if (!canCreate) {
    return {
      success: false,
      error: "PERMISSION_DENIED",
    }
  }

  // 3. Initialize Supabase client
  const supabase = await createServerClient()

  // 4. Insert notification record into database
  const { data: newNotification, error } = await supabase
    .from("notifications")
    .insert({
      user_id: safeData.userId,
      title: safeData.title,
      message: safeData.message,
      type: safeData.type,
      link: safeData.link || null,
    })
    .select()
    .single()

  if (error) {
    return {
      success: false,
      error: "CREATE_NOTIFICATION_ERROR",
      details: { database: [error.message] },
    }
  }

  // 5. Verify database response matches entity schema
  const parsedData = notificationRecordSchema.safeParse(newNotification)
  if (!parsedData.success) {
    console.error(
      "Database schema mismatch on createNotification:",
      parsedData.error
    )
    return {
      success: false,
      error: "DATA_VALIDATION_ERROR",
    }
  }

  // 6. Invalidate stale cache paths
  revalidatePath("/", "layout")

  return {
    success: true,
    data: parsedData.data,
  }
}

// ============================================================================
// Broadcast Notification Action
// ============================================================================

export async function broadcastNotification(
  payload: unknown
): Promise<ApiResult<BatchCountResult>> {
  // 1. Validate payload against Zod schema
  const validation = broadcastNotificationSchema.safeParse(payload)
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

  const safeData = validation.data

  // 2. Perform permission check
  const canBroadcast = await hasPermission(PERMISSIONS.BROADCAST_NOTIFICATION)
  if (!canBroadcast) {
    return {
      success: false,
      error: "PERMISSION_DENIED",
    }
  }

  // 3. Initialize Supabase client
  const supabase = await createServerClient()
  let targetUserIds: string[] = []

  // 4. Resolve target audience user IDs
  if (safeData.targetType === "all") {
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id")

    if (profilesError) {
      return {
        success: false,
        error: "FETCH_TARGET_USERS_ERROR",
        details: { database: [profilesError.message] },
      }
    }
    targetUserIds = profiles?.map((p) => p.id) || []
  } else if (
    safeData.targetType === "channels" &&
    safeData.channelIds.length > 0
  ) {
    const { data: subscribers, error: subsError } = await supabase
      .from("user_channel_subscriptions")
      .select("user_id")
      .in("channel_id", safeData.channelIds)
      .eq("is_subscribed", true)

    if (subsError) {
      return {
        success: false,
        error: "FETCH_CHANNEL_SUBSCRIBERS_ERROR",
        details: { database: [subsError.message] },
      }
    }

    targetUserIds = Array.from(
      new Set(subscribers?.map((s) => s.user_id) || [])
    )
  }

  if (targetUserIds.length === 0) {
    return {
      success: false,
      error: "NO_TARGET_USERS_FOUND",
    }
  }

  // 5. Batch insert notification rows
  const notificationsPayload = targetUserIds.map((userId) => ({
    user_id: userId,
    title: safeData.title,
    message: safeData.message,
    type: safeData.type,
    link: safeData.link || null,
  }))

  const { error: insertError } = await supabase
    .from("notifications")
    .insert(notificationsPayload)

  if (insertError) {
    return {
      success: false,
      error: "BROADCAST_INSERT_ERROR",
      details: { database: [insertError.message] },
    }
  }

  // 6. Invalidate stale cache paths
  revalidatePath("/", "layout")

  return {
    success: true,
    data: { count: targetUserIds.length },
  }
}
