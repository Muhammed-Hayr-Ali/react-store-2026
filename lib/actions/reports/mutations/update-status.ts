/**
 * @file lib/actions/reports/mutations/update-status.ts
 * @description Server Action to update the status and admin notes of a report.
 */

"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { UpdateReportStatusInput } from "../types"
import { updateReportStatusSchema } from "../schemas"
import { hasRole, ROLES } from "../../role"

export async function updateReportStatus(
  payload: UpdateReportStatusInput
): Promise<ApiResult<null>> {
  const isAdmin = await hasRole(ROLES.ADMIN)
  if (!isAdmin) {
    return {
      success: false,
      error: "UNAUTHORIZED_ACCESS",
    }
  }

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

  const { error } = await supabase
    .from("reports")
    .update({
      status,
      admin_notes: adminNotes || null,
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

  return {
    success: true,
    data: null,
  }
}
