/**
 * @file lib/actions/notifications/mutations/create-notification.ts
 * @description Server Actions to insert single and broadcast notifications into Supabase.
 */

"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { NotificationRecord } from "../types"
import {
  createNotificationSchema,
  broadcastNotificationSchema,
} from "../schemas"
import { hasPermission, PERMISSIONS } from "../../role"

export async function createNotification(
  payload: unknown
): Promise<ApiResult<NotificationRecord | null>> {
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

  const canSend = await hasPermission(PERMISSIONS.SEND_NOTIFICATION)
  if (!canSend) {
    return { success: false, error: "PERMISSION_DENIED" }
  }

  const supabase = await createServerClient()

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

  revalidatePath("/", "layout")

  return {
    success: true,
    data: newNotification as NotificationRecord,
  }
}

export async function broadcastNotification(
  payload: unknown
): Promise<ApiResult<{ count: number }>> {
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

  const canBroadcast = await hasPermission(PERMISSIONS.CREATE_NOTIFICATION)
  if (!canBroadcast) {
    return { success: false, error: "PERMISSION_DENIED" }
  }

  const supabase = await createServerClient()
  let targetUserIds: string[] = []

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
    return { success: false, error: "NO_TARGET_USERS_FOUND" }
  }

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

  revalidatePath("/", "layout")

  return {
    success: true,
    data: { count: targetUserIds.length },
  }
}
