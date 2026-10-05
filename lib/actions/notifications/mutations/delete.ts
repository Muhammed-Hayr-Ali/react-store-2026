/**
 * @file lib/actions/notifications/mutations/delete.ts
 * @description Server Actions to remove notification records.
 */

"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"

export async function deleteNotification(id: string): Promise<ApiResult<null>> {
  const idValidation = z.string().uuid("INVALID_ID").safeParse(id)
  if (!idValidation.success) {
    return { success: false, error: "INVALID_ID" }
  }

  const supabase = await createServerClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { success: false, error: "UNAUTHORIZED" }
  }

  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) {
    return {
      success: false,
      error: "DELETE_NOTIFICATION_ERROR",
      details: { database: [error.message] },
    }
  }

  revalidatePath("/", "layout")
  return { success: true, data: null }
}

export async function deleteAllNotifications(): Promise<ApiResult<null>> {
  const supabase = await createServerClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { success: false, error: "UNAUTHORIZED" }
  }

  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("user_id", user.id)

  if (error) {
    return {
      success: false,
      error: "DELETE_ALL_NOTIFICATIONS_ERROR",
      details: { database: [error.message] },
    }
  }

  revalidatePath("/", "layout")
  return { success: true, data: null }
}
