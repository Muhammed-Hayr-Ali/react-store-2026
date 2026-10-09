"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { NotificationChannelRecord } from "../../types"
import { createChannelSchema } from "../../schemas"
import { hasPermission, PERMISSIONS } from "../../../role"

export async function createNotificationChannel(
  payload: unknown
): Promise<ApiResult<NotificationChannelRecord>> {
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

  const canCreate = await hasPermission(PERMISSIONS.CREATE_NOTIFICATION_CHANNEL)
  if (!canCreate) {
    return { success: false, error: "PERMISSION_DENIED" }
  }

  const supabase = await createServerClient()

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
        details: { slug: ["This channel slug is already in use."] },
      }
    }

    return {
      success: false,
      error: "CREATE_CHANNEL_ERROR",
      details: { database: [error.message] },
    }
  }

  revalidatePath("/", "layout")

  return {
    success: true,
    data: newChannel as NotificationChannelRecord,
  }
}
