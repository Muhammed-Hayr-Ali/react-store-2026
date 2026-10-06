/**
 * @file lib/actions/reports/mutations/update-status.ts
 * @description Server Action to update the status and admin notes of a report.
 * Enforces parameter validation, schema parsing, permission checks, and route cache revalidation.
 */

"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { Report } from "../types"
import { reportSchema, updateReportStatusSchema } from "../schemas"
import { hasPermission, PERMISSIONS } from "../../role"

// ============================================================================
// Main Action Function
// ============================================================================

export async function updateReportStatus(
  payload: unknown
): Promise<ApiResult<Report | null>> {
  // 1. Validate update payload
  const validation = updateReportStatusSchema.safeParse(payload)
  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: validation.error.flatten().fieldErrors,
    }
  }

  const { reportId, status, adminNotes } = validation.data

  // 2. Perform permission check
  const canManage = await hasPermission(PERMISSIONS.MANAGE_REPORTS)
  if (!canManage) {
    return {
      success: false,
      error: "PERMISSION_DENIED",
    }
  }

  // 3. Initialize Supabase client
  const supabase = await createServerClient()

  // 4. Update database record
  const { data: updatedReport, error } = await supabase
    .from("reports")
    .update({
      status,
      admin_notes: adminNotes || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", reportId)
    .select()
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return {
        success: false,
        error: "REPORT_NOT_FOUND",
      }
    }

    return {
      success: false,
      error: "UPDATE_REPORT_ERROR",
      details: { database: [error.message] },
    }
  }

  // 5. Schema verification on database output
  const parsedData = reportSchema.safeParse(updatedReport)
  if (!parsedData.success) {
    console.error(
      "Database schema mismatch on updateReportStatus:",
      parsedData.error
    )
    return {
      success: false,
      error: "DATA_VALIDATION_ERROR",
    }
  }

  // 6. Invalidate related cache paths
  revalidatePath("/", "layout")

  return {
    success: true,
    data: parsedData.data,
  }
}
