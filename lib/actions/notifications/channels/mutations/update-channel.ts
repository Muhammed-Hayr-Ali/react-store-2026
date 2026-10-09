"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { NotificationChannelRecord } from "../../types"
import { updateChannelSchema } from "../../schemas"
import { hasPermission, PERMISSIONS } from "../../../role"

export async function updateNotificationChannel(
  payload: unknown
): Promise<ApiResult<NotificationChannelRecord>> {
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

  const canUpdate = await hasPermission(PERMISSIONS.UPDATE_NOTIFICATION_CHANNEL)
  if (!canUpdate) {
    return { success: false, error: "PERMISSION_DENIED" }
  }

  const { id, ...updateFields } = validation.data
  const supabase = await createServerClient()

  const dbPayload: Record<string, unknown> = {}
  if (updateFields.slug !== undefined)
    dbPayload.slug = updateFields.slug.toLowerCase().trim()
  if (updateFields.name !== undefined) dbPayload.name = updateFields.name.trim()
  if (updateFields.name_ar !== undefined)
    dbPayload.name_ar = updateFields.name_ar.trim()
  if (updateFields.description !== undefined)
    dbPayload.description = updateFields.description || null
  if (updateFields.description_ar !== undefined)
    dbPayload.description_ar = updateFields.description_ar || null
  if (updateFields.isMandatory !== undefined)
    dbPayload.is_mandatory = updateFields.isMandatory
  if (updateFields.defaultEnabled !== undefined)
    dbPayload.default_enabled = updateFields.defaultEnabled
  if (updateFields.isActive !== undefined)
    dbPayload.is_active = updateFields.isActive

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
        details: { slug: ["This channel slug is already in use."] },
      }
    }

    return {
      success: false,
      error: "UPDATE_CHANNEL_ERROR",
      details: { database: [error.message] },
    }
  }

  revalidatePath("/", "layout")

  return {
    success: true,
    data: updatedChannel as NotificationChannelRecord,
  }
}
