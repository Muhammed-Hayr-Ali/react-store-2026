/**
 * @file lib/actions/reports/queries/get-all.ts
 * @description Retrieves a paginated list of reports with optional status and targetType filters.
 */

"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { GetReportsFilterOptions, ReportWithDetails } from "../types"
import { getReportsFilterSchema } from "../schemas"
import { hasRole } from "../../role/role-checker"

// ============================================================================
// Main Query Function
// ============================================================================

export async function getAllReports(
  options: Partial<GetReportsFilterOptions> = {}
): Promise<ApiResult<{ reports: ReportWithDetails[]; total: number }>> {
  const validation = getReportsFilterSchema.safeParse(options)
  if (!validation.success) {
    return {
      success: false,
      error: "INVALID_PARAMETERS",
      details: validation.error.flatten().fieldErrors,
    }
  }

  const isAdmin = await hasRole("admin")
  if (!isAdmin) {
    return {
      success: false,
      error: "UNAUTHORIZED_ACCESS",
    }
  }

  const { status, targetType, limit, offset } = validation.data
  const supabase = await createServerClient()

  let query = supabase
    .from("reports")
    .select(
      `
      *,
      reporter:profiles!reports_reporter_id_fkey (
        id,
        first_name,
        last_name
      )
    `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (status) {
    query = query.eq("status", status)
  }

  if (targetType) {
    query = query.eq("target_type", targetType)
  }

  const { data, count, error } = await query

  if (error) {
    return {
      success: false,
      error: "FETCH_REPORTS_ERROR",
      details: { database: [error.message] },
    }
  }

  return {
    success: true,
    data: {
      reports: (data || []) as ReportWithDetails[],
      total: count || 0,
    },
  }
}
