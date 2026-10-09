/**
 * @file lib/actions/notifications/broadcasts/mutations/delete-notification.ts
 */

"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { hasRole, ROLES } from "../../../role"

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
    return { success: false, error: "UNAUTHORIZED_ACCESS" }
  }

  const isAdmin = await hasRole(ROLES.ADMIN)

  let query = supabase
    .from("notifications")
    .delete()
    .eq("id", idValidation.data)
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

export async function deleteBatchNotifications(
  ids: string[]
): Promise<ApiResult<{ count: number }>> {
  const idsValidation = z.array(z.string().uuid()).safeParse(ids)
  if (!idsValidation.success || idsValidation.data.length === 0) {
    return { success: false, error: "INVALID_OR_EMPTY_IDS" }
  }

  const validIds = idsValidation.data
  const supabase = await createServerClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { success: false, error: "UNAUTHORIZED_ACCESS" }
  }

  const isAdmin = await hasRole(ROLES.ADMIN)

  let query = supabase.from("notifications").delete().in("id", validIds)
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
  return { success: true, data: { count: validIds.length } }
}

export async function deleteAllNotifications(): Promise<ApiResult<null>> {
  const supabase = await createServerClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { success: false, error: "UNAUTHORIZED_ACCESS" }
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