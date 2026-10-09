"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { hasPermission, PERMISSIONS } from "../../../role"

export async function deleteNotificationChannel(
  id: string
): Promise<ApiResult<null>> {
  const validation = z.string().uuid("INVALID_ID").safeParse(id)
  if (!validation.success) {
    return { success: false, error: "INVALID_ID" }
  }

  const canDelete = await hasPermission(PERMISSIONS.DELETE_NOTIFICATION_CHANNEL)
  if (!canDelete) {
    return { success: false, error: "PERMISSION_DENIED" }
  }

  const supabase = await createServerClient()

  const { data: channel, error: checkError } = await supabase
    .from("notification_channels")
    .select("is_mandatory")
    .eq("id", validation.data)
    .single()

  if (checkError || !channel) {
    return { success: false, error: "CHANNEL_NOT_FOUND" }
  }

  if (channel.is_mandatory) {
    return { success: false, error: "CANNOT_DELETE_MANDATORY_CHANNEL" }
  }

  const { error } = await supabase
    .from("notification_channels")
    .delete()
    .eq("id", validation.data)

  if (error) {
    return {
      success: false,
      error: "DELETE_CHANNEL_ERROR",
      details: { database: [error.message] },
    }
  }

  revalidatePath("/", "layout")

  return { success: true, data: null }
}
