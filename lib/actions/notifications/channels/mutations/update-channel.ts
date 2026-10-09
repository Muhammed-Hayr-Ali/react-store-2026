/**
 * @file lib/actions/notifications/channels/mutations/update-channel.ts
 * @description Server Action to modify an existing notification channel by UUID.
 * Handles partial payload sanitization, permission validation, and dynamic route revalidation.
 */

"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { NotificationChannelRecord } from "../../types"
import { channelRecordSchema, updateChannelSchema } from "../../schemas"
import { hasPermission, PERMISSIONS } from "../../../role"

// ============================================================================
// Main Action Function
// ============================================================================

export async function updateNotificationChannel(
  id: string,
  payload: unknown
): Promise<ApiResult<NotificationChannelRecord | null>> {
  // 1. Validate UUID format
  const idValidation = z.string().uuid("INVALID_ID").safeParse(id)
  if (!idValidation.success) {
    return {
      success: false,
      error: "INVALID_ID",
    }
  }

  // 2. Validate partial update payload
  const validation = updateChannelSchema.safeParse(payload)
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

  // 3. Perform permission check
  const canUpdate = await hasPermission(PERMISSIONS.UPDATE_NOTIFICATION_CHANNEL)
  if (!canUpdate) {
    return {
      success: false,
      error: "PERMISSION_DENIED",
    }
  }

  // 4. Initialize Supabase client
  const supabase = await createServerClient()

  const dbPayload: Record<string, unknown> = {}
  if (safeData.slug !== undefined)
    dbPayload.slug = safeData.slug.toLowerCase().trim()
  if (safeData.name !== undefined) dbPayload.name = safeData.name.trim()
  if (safeData.name_ar !== undefined)
    dbPayload.name_ar = safeData.name_ar.trim()
  if (safeData.description !== undefined)
    dbPayload.description = safeData.description || null
  if (safeData.description_ar !== undefined)
    dbPayload.description_ar = safeData.description_ar || null
  if (safeData.isMandatory !== undefined)
    dbPayload.is_mandatory = safeData.isMandatory
  if (safeData.defaultEnabled !== undefined)
    dbPayload.default_enabled = safeData.defaultEnabled
  if (safeData.isActive !== undefined) dbPayload.is_active = safeData.isActive

  // 5. Update record in database
  const { data: updatedChannel, error } = await supabase
    .from("notification_channels")
    .update(dbPayload)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    if (error.code === "23505") {
      return {
        success: false,
        error: "SLUG_ALREADY_EXISTS",
      }
    }

    if (error.code === "PGRST116") {
      return {
        success: false,
        error: "CHANNEL_NOT_FOUND",
      }
    }

    return {
      success: false,
      error: "UPDATE_CHANNEL_ERROR",
      details: { database: [error.message] },
    }
  }

  // 6. Verify database output against channel schema
  const parsedData = channelRecordSchema.safeParse(updatedChannel)
  if (!parsedData.success) {
    console.error(
      "Database schema mismatch on updateNotificationChannel:",
      parsedData.error
    )
    return {
      success: false,
      error: "DATA_VALIDATION_ERROR",
    }
  }

  // 7. Invalidate dynamic route and layout cache
  revalidatePath("/", "layout")

  return {
    success: true,
    data: parsedData.data,
  }
}
