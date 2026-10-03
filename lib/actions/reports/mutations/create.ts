/**
 * @file lib/actions/reports/mutations/create.ts
 * @description Server Action to submit an issue or user moderation report.
 */

"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { CreateReportInput } from "../types"
import { createReportSchema } from "../schemas"

// ============================================================================
// Main Action Function
// ============================================================================

export async function submitReport(
  payload: CreateReportInput
): Promise<ApiResult<{ id: string }>> {
  // 1. Validate payload using Zod schema
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

  // 2. Verify authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      success: false,
      error: "UNAUTHORIZED_ACCESS",
    }
  }

  // 3. Insert report record
  const { data: newReport, error } = await supabase
    .from("reports")
    .insert({
      reporter_id: user.id,
      target_type: safeData.targetType,
      target_id: safeData.targetId || null,
      reason: safeData.reason,
      details: safeData.details || null,
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

  // 4. Invalidate admin reports list
  revalidatePath("/admin/reports")

  return {
    success: true,
    data: { id: newReport.id },
  }
}
