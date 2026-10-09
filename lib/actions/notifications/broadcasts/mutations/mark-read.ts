/**
 * @file lib/actions/notifications/broadcasts/mutations/mark-read.ts
 */

"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"

export async function markNotificationAsRead(
  id: string
): Promise<ApiResult<null>> {
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
    .update({ is_read: true })
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) {
    return {
      success: false,
      error: "MARK_READ_ERROR",
      details: { database: [error.message] },
    }
  }

  revalidatePath("/", "layout")
  return { success: true, data: null }
}

export async function markAllNotificationsAsRead(): Promise<ApiResult<null>> {
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
    .update({ is_read: true })
    .eq("user_id", user.id)
    .eq("is_read", false)

  if (error) {
    return {
      success: false,
      error: "MARK_ALL_READ_ERROR",
      details: { database: [error.message] },
    }
  }

  revalidatePath("/", "layout")
  return { success: true, data: null }
}