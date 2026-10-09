/**
 * @file lib/actions/notifications/channels/mutations/create-channel.ts
 * @description Server Action to insert a new notification channel into Supabase.
 * Enforces Zod schema parsing, permission verification, duplicate slug detection, and cache revalidation.
 */

"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { NotificationChannelRecord } from "../../types"
import { channelRecordSchema, createChannelSchema } from "../../schemas"
import { hasPermission, PERMISSIONS } from "../../../role"

// ============================================================================
// Main Action Function
// ============================================================================

export async function createNotificationChannel(
  payload: unknown
): Promise<ApiResult<NotificationChannelRecord | null>> {
  // 1. Validate payload against Zod schema
  const validation = createChannelSchema.safeParse(payload)
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
  const canCreate = await hasPermission(PERMISSIONS.CREATE_NOTIFICATION_CHANNEL)
  if (!canCreate) {
    return {
      success: false,
      error: "PERMISSION_DENIED",
    }
  }

  // 3. Initialize Supabase client
  const supabase = await createServerClient()

  // 4. Insert channel record into database
  const { data: newChannel, error } = await supabase
    .from("notification_channels")
    .insert({
      slug: safeData.slug.toLowerCase().trim(),
      name: safeData.name.trim(),
      name_ar: safeData.name_ar.trim(),
      description: safeData.description || null,
      description_ar: safeData.description_ar || null,
      is_mandatory: safeData.isMandatory,
      default_enabled: safeData.defaultEnabled,
      is_active: safeData.isActive,
    })
    .select()
    .single()

  if (error) {
    if (error.code === "23505") {
      return {
        success: false,
        error: "SLUG_ALREADY_EXISTS",
      }
    }

    return {
      success: false,
      error: "CREATE_CHANNEL_ERROR",
      details: { database: [error.message] },
    }
  }

  // 5. Verify database response matches entity schema
  const parsedData = channelRecordSchema.safeParse(newChannel)
  if (!parsedData.success) {
    console.error(
      "Database schema mismatch on createNotificationChannel:",
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
