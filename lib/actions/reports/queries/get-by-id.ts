/**
 * @file lib/actions/reports/queries/get-by-id.ts
 * @description Retrieves a single report by UUID with safe profile and target details.
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
  // 1. التحقق من صيغة الـ UUID
  const idValidation = z.string().uuid("INVALID_ID").safeParse(id)
  if (!idValidation.success) {
    return {
      success: false,
      error: "INVALID_ID",
    }
  }

  // 2. التحقق من صلاحيات الأدمن
  const isAdmin = await hasRole(ROLES.ADMIN)
  if (!isAdmin) {
    return {
      success: false,
      error: "UNAUTHORIZED_ACCESS",
    }
  }

  const supabase = await createServerClient()

  // 3. جلب البلاغ مباشرة بدون Join قسري
  const { data: report, error } = await supabase
    .from("reports")
    .select("*")
    .eq("id", idValidation.data)
    .maybeSingle()

  if (error) {
    console.error("🔴 [getReportById Error]:", error.message)
    return {
      success: false,
      error: "FETCH_REPORT_ERROR",
      details: { database: [error.message] },
    }
  }

  if (!report) {
    return {
      success: true,
      data: null,
    }
  }

  // 4. جلب بيانات صاحب البلاغ إن وجد
  let reporter = null
  if (report.reporter_id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, email")
      .eq("id", report.reporter_id)
      .maybeSingle()

    if (profile) {
      reporter = profile
    }
  }

  // 5. جلب معاينة العنصر المبلغ عنه (مراجعة أو منتج)
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
      reporter,
      target_preview,
    } as ReportWithDetails,
  }
}
