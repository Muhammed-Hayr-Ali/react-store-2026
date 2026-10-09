/**
 * @file lib/actions/notifications/broadcasts/mutations/delete-notification.ts
 * @description Server Actions to delete single, batch, or all notifications for a user or admin.
 * Verifies UUID structures, checks user authorization, and revalidates caches.
 */

"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { BatchCountResult } from "../../types"
import { hasRole, ROLES } from "../../../role"

// ============================================================================
// Single Notification Delete
// ============================================================================

export async function deleteNotification(id: string): Promise<ApiResult<null>> {
  // 1. Validate UUID format
  const idValidation = z.string().uuid("INVALID_ID").safeParse(id)
  if (!idValidation.success) {
    return {
      success: false,
      error: "INVALID_ID",
    }
  }

  // 2. Initialize Supabase client
  const supabase = await createServerClient()

  // 3. Authenticate current user session
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return {
      success: false,
      error: "UNAUTHORIZED_ACCESS",
    }
  }

  // 4. Perform scoped delete (Admin can delete any; standard users only their own)
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

  // 5. Invalidate stale cache paths
  revalidatePath("/", "layout")

  return {
    success: true,
    data: null,
  }
}

// ============================================================================
// Batch Notifications Delete
// ============================================================================

export async function deleteBatchNotifications(
  ids: string[]
): Promise<ApiResult<BatchCountResult>> {
  // 1. Validate array of UUIDs
  const idsValidation = z.array(z.string().uuid()).min(1).safeParse(ids)
  if (!idsValidation.success) {
    return {
      success: false,
      error: "INVALID_OR_EMPTY_IDS",
    }
  }

  const validIds = idsValidation.data

  // 2. Initialize Supabase client
  const supabase = await createServerClient()

  // 3. Authenticate current user session
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return {
      success: false,
      error: "UNAUTHORIZED_ACCESS",
    }
  }

  // 4. Perform scoped batch delete
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

  // 5. Invalidate stale cache paths
  revalidatePath("/", "layout")

  return {
    success: true,
    data: { count: validIds.length },
  }
}

// ============================================================================
// Delete All User Notifications
// ============================================================================

export async function deleteAllNotifications(): Promise<ApiResult<null>> {
  // 1. Initialize Supabase client
  const supabase = await createServerClient()

  // 2. Authenticate current user session
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return {
      success: false,
      error: "UNAUTHORIZED_ACCESS",
    }
  }

  // 3. Purge user notifications
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

  // 4. Invalidate stale cache paths
  revalidatePath("/", "layout")

  return {
    success: true,
    data: null,
  }
}
