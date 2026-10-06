/**
 * @file lib/actions/reports/mutations/resolve-action.ts
 * @description Moderation action to directly dismiss a report or remove offending content.
 * Enforces payload validation, permission checks, conditional sub-permissions, and cache invalidation.
 */

"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { Report } from "../types"
import { reportSchema, resolveReportActionSchema } from "../schemas"
import { hasPermission, PERMISSIONS } from "../../role"

// ============================================================================
// Main Action Function
// ============================================================================

export async function resolveReportAction(
  payload: unknown
): Promise<ApiResult<Report | null>> {
  // 1. Validate payload
  const validation = resolveReportActionSchema.safeParse(payload)
  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: validation.error.flatten().fieldErrors,
    }
  }

  const { reportId, action, adminNotes } = validation.data

  // 2. Perform permission check
  const canManage = await hasPermission(PERMISSIONS.MANAGE_REPORTS)
  if (!canManage) {
    return {
      success: false,
      error: "PERMISSION_DENIED",
    }
  }

  const supabase = await createServerClient()

  // 3. Fetch report details
  const { data: report, error: fetchError } = await supabase
    .from("reports")
    .select("id, target_type, target_id")
    .eq("id", reportId)
    .single()

  if (fetchError || !report) {
    return {
      success: false,
      error: "REPORT_NOT_FOUND",
    }
  }

  // 4. Perform target action if instructed
  if (action === "delete_target" && report.target_id) {
    if (report.target_type === "review") {
      const canModerateReviews = await hasPermission(PERMISSIONS.UPDATE_REVIEW)
      if (!canModerateReviews) {
        return {
          success: false,
          error: "PERMISSION_DENIED",
        }
      }
      await supabase.from("product_reviews").delete().eq("id", report.target_id)
    }
  }

  // 5. Mark report as resolved or dismissed
  const finalStatus = action === "dismiss" ? "dismissed" : "resolved"

  const { data: updatedReport, error: updateError } = await supabase
    .from("reports")
    .update({
      status: finalStatus,
      admin_notes:
        adminNotes ||
        (action === "delete_target"
          ? "Offending content removed"
          : "Dismissed after review"),
      updated_at: new Date().toISOString(),
    })
    .eq("id", reportId)
    .select()
    .single()

  if (updateError) {
    return {
      success: false,
      error: "RESOLVE_REPORT_ERROR",
      details: { database: [updateError.message] },
    }
  }

  // 6. Schema verification on database output
  const parsedData = reportSchema.safeParse(updatedReport)
  if (!parsedData.success) {
    console.error(
      "Database schema mismatch on resolveReportAction:",
      parsedData.error
    )
    return {
      success: false,
      error: "DATA_VALIDATION_ERROR",
    }
  }

  // 7. Invalidate related cache paths
  revalidatePath("/", "layout")

  return {
    success: true,
    data: parsedData.data,
  }
}
