/**
 * @file lib/actions/reports/queries/get-by-id.ts
 * @description Retrieves a single report's detailed information by primary key UUID with target preview.
 */

"use server"

import { z } from "zod"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { ReportWithDetails, TargetPreview } from "../types"
import { hasRole, ROLES } from "../../role"

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

  const isAdmin = await hasRole(ROLES.ADMIN)
  if (!isAdmin) {
    return {
      success: false,
      error: "UNAUTHORIZED_ACCESS",
    }
  }

  const supabase = await createServerClient()

  const { data: report, error } = await supabase
    .from("reports")
    .select(
      `
      *,
      reporter:profiles!reports_reporter_id_fkey (
        id,
        first_name,
        last_name,
        email
      )
    `
    )
    .eq("id", idValidation.data)
    .maybeSingle()

  if (error) {
    return {
      success: false,
      error: "FETCH_REPORT_BY_ID_ERROR",
      details: { database: [error.message] },
    }
  }

  if (!report) {
    return { success: true, data: null }
  }

  let target_preview: TargetPreview = null

  if (report.target_id) {
    if (report.target_type === "review") {
      const { data: reviewData } = await supabase
        .from("product_reviews")
        .select("id, rating, comment, product_id, user_id")
        .eq("id", report.target_id)
        .maybeSingle()

      if (reviewData) {
        target_preview = { type: "review", data: reviewData }
      }
    } else if (report.target_type === "product") {
      const { data: productData } = await supabase
        .from("products")
        .select("id, name, slug")
        .eq("id", report.target_id)
        .maybeSingle()

      if (productData) {
        target_preview = { type: "product", data: productData }
      }
    }
  }

  return {
    success: true,
    data: {
      ...report,
      target_preview,
    } as ReportWithDetails,
  }
}
