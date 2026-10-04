/**
 * @file lib/actions/reports/queries/get-all.ts
 * @description Retrieves a paginated list of reports with reporter profile and target item previews.
 */

"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import {
  GetReportsFilterOptions,
  ReportWithDetails,
  TargetPreview,
} from "../types"
import { getReportsFilterSchema } from "../schemas"
import { hasRole, ROLES } from "../../role"

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

  const isAdmin = await hasRole(ROLES.ADMIN)
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
        last_name,
        email
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

  const { data: reports, count, error } = await query

  if (error) {
    return {
      success: false,
      error: "FETCH_REPORTS_ERROR",
      details: { database: [error.message] },
    }
  }

  // جلب معاينة الهدف المبلّغ عنه (Preview) لعرضه للمشرف مباشرة
  const populatedReports: ReportWithDetails[] = await Promise.all(
    (reports || []).map(async (rep) => {
      let target_preview: TargetPreview = null

      if (rep.target_id) {
        if (rep.target_type === "review") {
          const { data: reviewData } = await supabase
            .from("product_reviews")
            .select("id, rating, comment, product_id, user_id")
            .eq("id", rep.target_id)
            .maybeSingle()

          if (reviewData) {
            target_preview = { type: "review", data: reviewData }
          }
        } else if (rep.target_type === "product") {
          const { data: productData } = await supabase
            .from("products")
            .select("id, name, slug")
            .eq("id", rep.target_id)
            .maybeSingle()

          if (productData) {
            target_preview = { type: "product", data: productData }
          }
        }
      }

      return {
        ...rep,
        target_preview,
      } as ReportWithDetails
    })
  )

  return {
    success: true,
    data: {
      reports: populatedReports,
      total: count || 0,
    },
  }
}
