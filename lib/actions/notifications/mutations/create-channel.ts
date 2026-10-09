/**
 * @file lib/actions/notifications/mutations/create-channel.ts
 */

"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { NotificationChannelRecord } from "../types"
import { hasPermission, PERMISSIONS } from "../../role"

const createChannelSchema = z.object({
  slug: z.string().min(2).max(50),
  name: z.string().min(2).max(100),
  name_ar: z.string().min(2).max(100),
  description: z.string().optional().nullable(),
  description_ar: z.string().optional().nullable(),
  isMandatory: z.boolean().default(false),
  defaultEnabled: z.boolean().default(true),
})

export async function createNotificationChannel(
  payload: unknown
): Promise<ApiResult<NotificationChannelRecord>> {
  const canCreate = await hasPermission(PERMISSIONS.CREATE_NOTIFICATION)
  if (!canCreate) {
    return { success: false, error: "PERMISSION_DENIED" }
  }

  const parsed = createChannelSchema.safeParse(payload)
  if (!parsed.success) {
    return { success: false, error: "VALIDATION_ERROR" }
  }

  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from("notification_channels")
    .insert({
      slug: parsed.data.slug.toLowerCase().trim(),
      name: parsed.data.name.trim(),
      name_ar: parsed.data.name_ar.trim(),
      description: parsed.data.description || null,
      description_ar: parsed.data.description_ar || null,
      is_mandatory: parsed.data.isMandatory,
      default_enabled: parsed.data.defaultEnabled,
      is_active: true,
    })
    .select()
    .single()

  if (error) {
    return {
      success: false,
      error: "CREATE_CHANNEL_ERROR",
      details: { database: [error.message] },
    }
  }

  revalidatePath("/", "layout")
  return { success: true, data: data as NotificationChannelRecord }
}
