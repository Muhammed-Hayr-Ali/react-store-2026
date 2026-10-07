/**
 * @file lib/actions/reports/queries/get-all.ts
 * @description Retrieves a paginated list of reports with safe profile resolution and target preview.
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
  const isAdmin = await hasRole(ROLES.ADMIN)
  if (!isAdmin) {
    return {
      success: false,
      error: "UNAUTHORIZED_ACCESS",
    }
  }

  const validation = getReportsFilterSchema.safeParse(options)
  if (!validation.success) {
    const fieldErrors: Record<string, string[]> = {}
    for (const issue of validation.error.issues) {
      const path = issue.path.join(".")
      if (!fieldErrors[path]) fieldErrors[path] = []
      fieldErrors[path].push(issue.message)
    }
    return {
      success: false,
      error: "INVALID_PARAMETERS",
      details: fieldErrors,
    }
  }

  const { status, targetType, limit, offset } = validation.data
  const supabase = await createServerClient()

  let query = supabase
    .from("reports")
    .select("*", { count: "exact" })
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
    console.error("🔴 [getAllReports Error]:", error.message)
    return {
      success: false,
      error: "FETCH_REPORTS_ERROR",
      details: { database: [error.message] },
    }
  }

  if (!reports || reports.length === 0) {
    return {
      success: true,
      data: {
        reports: [],
        total: count || 0,
      },
    }
  }

  const reporterIds = Array.from(
    new Set(
      reports
        .map((r) => r.reporter_id)
        .filter((id): id is string => Boolean(id))
    )
  )

  let profilesMap: Record<
    string,
    {
      id: string
      first_name?: string | null
      last_name?: string | null
      email?: string | null
    }
  > = {}

  if (reporterIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, email")
      .in("id", reporterIds)

    if (profiles) {
      profilesMap = Object.fromEntries(profiles.map((p) => [p.id, p]))
    }
  }

  const populatedReports: ReportWithDetails[] = await Promise.all(
    reports.map(async (rep) => {
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
        reporter: rep.reporter_id ? profilesMap[rep.reporter_id] || null : null,
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
