/**
 * @file lib/actions/notifications/broadcasts/mutations/mark-read.ts
 * @description Server Actions to mark specific or all notifications as read for current user.
 * Enforces UUID format validation, user authentication, and cache revalidation.
 */

"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"

// ============================================================================
// Mark Single Notification As Read
// ============================================================================

export async function markNotificationAsRead(
  id: string
): Promise<ApiResult<null>> {
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

  // 4. Update status in database
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", idValidation.data)
    .eq("user_id", user.id)

  if (error) {
    return {
      success: false,
      error: "MARK_READ_ERROR",
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
// Mark All Notifications As Read
// ============================================================================

export async function markAllNotificationsAsRead(): Promise<ApiResult<null>> {
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

  // 3. Update status for all unread notifications
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

  // 4. Invalidate stale cache paths
  revalidatePath("/", "layout")

  return {
    success: true,
    data: null,
  }
}
