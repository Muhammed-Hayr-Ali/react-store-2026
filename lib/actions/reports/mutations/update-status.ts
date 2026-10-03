/**
 * @file lib/actions/reports/mutations/update-status.ts
 * @description Server Action to update the moderation status of a report (admin only).
 */

"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { UpdateReportStatusInput } from "../types"
import { updateReportStatusSchema } from "../schemas"
import { hasRole } from "../../role/role-checker"
import { hasPermission } from "../../role/permission-checker"

// ============================================================================
// Main Action Function
// ============================================================================

export async function updateReportStatus(
  payload: UpdateReportStatusInput
): Promise<ApiResult<null>> {
  // 1. Validate payload
  const validation = updateReportStatusSchema.safeParse(payload)
  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: validation.error.flatten().fieldErrors,
    }
  }

  const { reportId, status, adminNotes } = validation.data

  // 2. Verify admin access
  const [isAdmin, canModerate] = await Promise.all([
    hasRole("admin"),
    hasPermission("manage_reports"),
  ])

  if (!isAdmin && !canModerate) {
    return {
      success: false,
      error: "UNAUTHORIZED_ACCESS",
    }
  }

  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isClosed = status === "resolved" || status === "dismissed"

  // 3. Update database record
  const { error } = await supabase
    .from("reports")
    .update({
      status,
      admin_notes: adminNotes || null,
      resolved_by: isClosed ? user?.id : null,
      resolved_at: isClosed ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", reportId)

  if (error) {
    return {
      success: false,
      error: "UPDATE_REPORT_ERROR",
      details: { database: [error.message] },
    }
  }

  revalidatePath("/admin/reports")
  revalidatePath(`/admin/reports/${reportId}`)

  return {
    success: true,
    data: null,
  }
}
