/**
 * @file lib/actions/notifications/mutations/delete.ts
 * @description Server Actions to remove notification records with admin authorization checks.
 */

"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { hasRole, ROLES } from "../../role"

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

  const isAdmin = await hasRole(ROLES.ADMIN)

  let query = supabase.from("notifications").delete().eq("id", id)
  if (!isAdmin) {
    query = query.eq("user_id", user.id)
  }

  const { error } = await query

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

// دالة حذف مجموعة إشعارات دفعة واحدة (للإشعارات المجمعة / Broadcast)
export async function deleteBatchNotifications(
  ids: string[]
): Promise<ApiResult<{ count: number }>> {
  if (!ids || ids.length === 0) {
    return { success: false, error: "NO_IDS_PROVIDED" }
  }

  const supabase = await createServerClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { success: false, error: "UNAUTHORIZED" }
  }

  const isAdmin = await hasRole(ROLES.ADMIN)

  let query = supabase.from("notifications").delete().in("id", ids)
  if (!isAdmin) {
    query = query.eq("user_id", user.id)
  }

  const { error } = await query

  if (error) {
    return {
      success: false,
      error: "DELETE_BATCH_ERROR",
      details: { database: [error.message] },
    }
  }

  revalidatePath("/", "layout")
  return { success: true, data: { count: ids.length } }
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
