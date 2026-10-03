/**
 * @file lib/actions/reports/mutations/delete.ts
 * @description Server Action to permanently remove a report (admin only).
 */

"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { hasRole } from "../../role/role-checker"

// ============================================================================
// Main Action Function
// ============================================================================

export async function deleteReport(id: string): Promise<ApiResult<null>> {
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
  const { error } = await supabase.from("reports").delete().eq("id", id)

  if (error) {
    return {
      success: false,
      error: "DELETE_REPORT_ERROR",
      details: { database: [error.message] },
    }
  }

  revalidatePath("/admin/reports")

  return {
    success: true,
    data: null,
  }
}
