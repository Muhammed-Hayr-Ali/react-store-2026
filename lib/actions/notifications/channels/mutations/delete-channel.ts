/**
 * @file lib/actions/notifications/channels/mutations/delete-channel.ts
 * @description Server Action to permanently remove a notification channel record by UUID.
 * Verifies ID structure, confirms permission access, checks mandatory state, and purges stale route caches.
 */

"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { hasPermission, PERMISSIONS } from "../../../role"

// ============================================================================
// Main Action Function
// ============================================================================

export async function deleteNotificationChannel(
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

  // 2. Perform permission check
  const canDelete = await hasPermission(PERMISSIONS.DELETE_NOTIFICATION_CHANNEL)
  if (!canDelete) {
    return {
      success: false,
      error: "PERMISSION_DENIED",
    }
  }

  // 3. Initialize Supabase client
  const supabase = await createServerClient()

  // 4. Verify channel existence and mandatory guard
  const { data: channel, error: checkError } = await supabase
    .from("notification_channels")
    .select("is_mandatory")
    .eq("id", id)
    .single()

  if (checkError || !channel) {
    return {
      success: false,
      error: "CHANNEL_NOT_FOUND",
    }
  }

  if (channel.is_mandatory) {
    return {
      success: false,
      error: "CANNOT_DELETE_MANDATORY_CHANNEL",
    }
  }

  // 5. Delete record from notification_channels table
  const { error } = await supabase
    .from("notification_channels")
    .delete()
    .eq("id", id)

  if (error) {
    return {
      success: false,
      error: "DELETE_CHANNEL_ERROR",
      details: { database: [error.message] },
    }
  }

  // 6. Invalidate stale cache paths
  revalidatePath("/", "layout")

  return {
    success: true,
    data: null,
  }
}
