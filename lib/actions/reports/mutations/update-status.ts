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
import { hasRole, hasPermission, ROLES, PERMISSIONS } from "../../role"

// ============================================================================
// Main Action Function
// ============================================================================

export async function updateReportStatus(
  payload: UpdateReportStatusInput
): Promise<ApiResult<null>> {
  // 1. Parallel authorization checks
  const [isAdmin, canModerate] = await Promise.all([
    hasRole(ROLES.ADMIN),
    hasPermission(PERMISSIONS.MANAGE_REPORTS),
  ])

  if (!isAdmin) {
    return {
      success: false,
      error: "UNAUTHORIZED_ACCESS",
    }
  }

  if (!canModerate) {
    return {
      success: false,
      error: "PERMISSION_DENIED",
    }
  }

  // 2. Validate payload
  const validation = updateReportStatusSchema.safeParse(payload)
  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: validation.error.flatten().fieldErrors,
    }
  }

  const { reportId, status, adminNotes } = validation.data
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

  // 4. Invalidate caches
  revalidatePath("/", "layout")

  return {
    success: true,
    data: null,
  }
}
