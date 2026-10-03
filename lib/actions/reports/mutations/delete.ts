/**
 * @file lib/actions/reports/mutations/delete.ts
 * @description Server Action to permanently remove a report (admin only).
 */

"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { hasRole, hasPermission, ROLES, PERMISSIONS } from "../../role"

// ============================================================================
// Main Action Function
// ============================================================================

export async function deleteReport(id: string): Promise<ApiResult<null>> {
  // 1. Validate ID format
  const idValidation = z.string().uuid("INVALID_ID").safeParse(id)
  if (!idValidation.success) {
    return {
      success: false,
      error: "INVALID_ID",
    }
  }

  // 2. Parallel authorization checks
  const [isAdmin, canDelete] = await Promise.all([
    hasRole(ROLES.ADMIN),
    hasPermission(PERMISSIONS.DELETE_REPORT),
  ])

  if (!isAdmin) {
    return {
      success: false,
      error: "UNAUTHORIZED_ACCESS",
    }
  }

  if (!canDelete) {
    return {
      success: false,
      error: "PERMISSION_DENIED",
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

  // 3. Invalidate caches
  revalidatePath("/", "layout")

  return {
    success: true,
    data: null,
  }
}
