/**
 * @file lib/actions/reports/mutations/resolve-action.ts
 * @description Moderation action to directly dismiss a report or remove offending content.
 */

"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { ResolveReportActionInput } from "../types"
import { resolveReportActionSchema } from "../schemas"
import { hasRole, ROLES } from "../../role"

export async function resolveReportAction(
  payload: ResolveReportActionInput
): Promise<ApiResult<null>> {
  const isAdmin = await hasRole(ROLES.ADMIN)
  if (!isAdmin) {
    return {
      success: false,
      error: "UNAUTHORIZED_ACCESS",
    }
  }

  const validation = resolveReportActionSchema.safeParse(payload)
  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: validation.error.flatten().fieldErrors,
    }
  }

  const { reportId, action, adminNotes } = validation.data
  const supabase = await createServerClient()

  // 1. Fetch report details
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

  // 2. Perform target action if instructed
  if (action === "delete_target" && report.target_id) {
    if (report.target_type === "review") {
      await supabase.from("product_reviews").delete().eq("id", report.target_id)
    }
  }

  // 3. Mark report as resolved or dismissed
  const finalStatus = action === "dismiss" ? "dismissed" : "resolved"

  const { error: updateError } = await supabase
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

  if (updateError) {
    return {
      success: false,
      error: "RESOLVE_REPORT_ERROR",
      details: { database: [updateError.message] },
    }
  }

  revalidatePath("/admin/reports")

  return {
    success: true,
    data: null,
  }
}
