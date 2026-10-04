/**
 * @file lib/actions/reports/mutations/create.ts
 * @description Server Action to submit an issue or moderation report.
 * Enforces payload validation, user authorization for protected content, duplicate checking, and cache revalidation.
 */

"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { CreateReportInput } from "../types"
import { createReportSchema } from "../schemas"
import { hasPermission, PERMISSIONS } from "../../role"

// ============================================================================
// Main Action Function
// ============================================================================

export async function submitReport(
  payload: CreateReportInput
): Promise<ApiResult<{ id: string }>> {
  // 1. Validate payload
  const validation = createReportSchema.safeParse(payload)
  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: validation.error.flatten().fieldErrors,
    }
  }

  const safeData = validation.data
  const supabase = await createServerClient()

  // 2. Fetch authenticated user (if any)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const reporterId = user?.id || null

  // 3. Authenticated reports must belong to registered users when targeting user content
  if (
    !reporterId &&
    (safeData.targetType === "review" || safeData.targetType === "product")
  ) {
    return {
      success: false,
      error: "AUTH_REQUIRED_FOR_CONTENT_REPORT",
      details: { auth: ["Please log in to report this item."] },
    }
  }

  // 4. Permission check for registered users
  if (reporterId) {
    const canCreate = await hasPermission(PERMISSIONS.CREATE_REPORT)
    if (!canCreate) {
      return {
        success: false,
        error: "PERMISSION_DENIED",
      }
    }
  }

  // 5. Prevent duplicate pending reports from the same user for the same target
  if (reporterId && safeData.targetId) {
    const { data: existingReport } = await supabase
      .from("reports")
      .select("id")
      .eq("reporter_id", reporterId)
      .eq("target_type", safeData.targetType)
      .eq("target_id", safeData.targetId)
      .eq("status", "pending")
      .maybeSingle()

    if (existingReport) {
      return {
        success: false,
        error: "ALREADY_REPORTED",
        details: {
          form: ["You have already submitted a pending report for this item."],
        },
      }
    }
  }

  // 6. Insert the report
  const { data: newReport, error } = await supabase
    .from("reports")
    .insert({
      reporter_id: reporterId,
      target_type: safeData.targetType,
      target_id: safeData.targetId || null,
      reason: safeData.reason,
      details: safeData.details || null,
      contact_email: safeData.contactEmail || null,
      status: "pending",
    })
    .select("id")
    .single()

  if (error) {
    return {
      success: false,
      error: "CREATE_REPORT_ERROR",
      details: { database: [error.message] },
    }
  }

  // 7. Invalidate related cache paths
  revalidatePath("/dashboard/reports")
  revalidatePath("/", "layout")

  return {
    success: true,
    data: { id: newReport.id },
  }
}
