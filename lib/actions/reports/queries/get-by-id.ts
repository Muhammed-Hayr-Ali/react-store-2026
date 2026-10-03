/**
 * @file lib/actions/reports/queries/get-by-id.ts
 * @description Retrieves a single report's detailed information by primary key UUID.
 */

"use server"

import { z } from "zod"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { ReportWithDetails } from "../types"
import { hasRole } from "../../role/role-checker"

// ============================================================================
// Main Query Function
// ============================================================================

export async function getReportById(
  id: string
): Promise<ApiResult<ReportWithDetails | null>> {
  const idValidation = z.string().uuid("INVALID_ID").safeParse(id)
  if (!idValidation.success) {
    return {
      success: false,
      error: "INVALID_ID",
    }
  }

  const isAdmin = await hasRole("admin")
  if (!isAdmin) {
    return {
      success: false,
      error: "UNAUTHORIZED_ACCESS",
    }
  }

  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("reports")
    .select(
      `
      *,
      reporter:profiles!reports_reporter_id_fkey (
        id,
        first_name,
        last_name
      ),
      resolver:profiles!reports_resolved_by_fkey (
        id,
        first_name,
        last_name
      )
    `
    )
    .eq("id", idValidation.data)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return { success: true, data: null }
    }
    return {
      success: false,
      error: "FETCH_REPORT_BY_ID_ERROR",
      details: { database: [error.message] },
    }
  }

  return {
    success: true,
    data: data as ReportWithDetails,
  }
}
