/**
 * @file lib/actions/notifications/broadcasts/queries/get-admin-notifications.ts
 */

"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { AdminNotificationRecord } from "../../types"
import { hasRole, ROLES } from "../../../role"

export async function getAdminNotifications(): Promise<
  ApiResult<AdminNotificationRecord[]>
> {
  const isAdmin = await hasRole(ROLES.ADMIN)
  if (!isAdmin) {
    return { success: false, error: "FORBIDDEN" }
  }

  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("notifications")
    .select("*, profiles (id, first_name, last_name, email)")
    .order("created_at", { ascending: false })

  if (error) {
    return {
      success: false,
      error: "FETCH_ADMIN_NOTIFICATIONS_ERROR",
      details: { database: [error.message] },
    }
  }

  return { success: true, data: data as AdminNotificationRecord[] }
}