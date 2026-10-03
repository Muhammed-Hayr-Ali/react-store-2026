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
import { hasRole, hasPermission, ROLES, PERMISSIONS } from "../../role"

// ============================================================================
// Main Action Function
// ============================================================================

export async function submitReport(
  payload: CreateReportInput
): Promise<ApiResult<{ id: string }>> {
  // 1. Parallel authorization checks
  const [isCustomer, canCreate] = await Promise.all([
    hasRole(ROLES.CUSTOMER),
    hasPermission(PERMISSIONS.CREATE_REPORT),
  ])

  if (!isCustomer) {
    return {
      success: false,
      error: "UNAUTHORIZED_ACCESS",
    }
  }

  if (!canCreate) {
    return {
      success: false,
      error: "PERMISSION_DENIED",
    }
  }

  // 2. Validate payload using Zod schema
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

  // 3. Verify user session
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      success: false,
      error: "UNAUTHORIZED_ACCESS",
    }
  }

  // 4. Insert report record
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

  // 5. Invalidate caches
  revalidatePath("/", "layout")

  return {
    success: true,
    data: { id: newReport.id },
  }
}
