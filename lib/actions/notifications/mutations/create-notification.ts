/**
 * @file lib/actions/notifications/mutations/create-notification.ts
 * @description Server Actions to insert single and broadcast notifications into Supabase.
 * Enforces Zod schema parsing, permission verification, database insertion, and cache revalidation.
 */

"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import {
  createNotificationSchema,
  broadcastNotificationSchema,
} from "../schemas"
import { hasPermission, PERMISSIONS } from "../../role"

// ============================================================================
// Single Notification Action
// ============================================================================

export async function createNotification(
  payload: unknown
): Promise<ApiResult<Notification | null>> {
  // 1. Validate payload against Zod schema
  const validation = createNotificationSchema.safeParse(payload)
  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: validation.error.flatten().fieldErrors,
    }
  }

  const safeData = validation.data

  // 2. Perform permission check
  const canSend = await hasPermission(PERMISSIONS.SEND_NOTIFICATION)
  if (!canSend) {
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

  // 5. Invalidate stale cache paths
  revalidatePath("/", "layout")

  return {
    success: true,
    data: newNotification as Notification,
  }
}

// ============================================================================
// Broadcast Notification Action
// ============================================================================

export async function broadcastNotification(
  payload: unknown
): Promise<ApiResult<{ count: number }>> {
  // 1. Validate payload against Zod schema
  const validation = broadcastNotificationSchema.safeParse(payload)
  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: validation.error.flatten().fieldErrors,
    }
  }

  const safeData = validation.data

  // 2. Perform permission check
  const canBroadcast = await hasPermission(PERMISSIONS.CREATE_NOTIFICATION)
  if (!canBroadcast) {
    return {
      success: false,
      error: "PERMISSION_DENIED",
    }
  }

  // 3. Initialize Supabase client
  const supabase = await createServerClient()

  // 4. Resolve target user IDs
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
  } else if (safeData.targetType === "role" && safeData.roleName) {
    const { data: roleMembers, error: roleError } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", safeData.roleName)

    if (roleError) {
      return {
        success: false,
        error: "FETCH_ROLE_USERS_ERROR",
        details: { database: [roleError.message] },
      }
    }
    targetUserIds = roleMembers?.map((r) => r.user_id) || []
  }

  if (targetUserIds.length === 0) {
    return {
      success: false,
      error: "NO_TARGET_USERS_FOUND",
    }
  }

  // 5. Prepare batch insert records
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
