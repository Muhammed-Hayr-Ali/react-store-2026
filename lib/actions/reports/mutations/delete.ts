/**
 * @file lib/actions/reports/mutations/delete.ts
 * @description Server Action to permanently remove a report.
 * Enforces ID validation, permission checks, and route cache revalidation.
 */

"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { hasPermission, PERMISSIONS } from "../../role"

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

  // 2. Perform permission check
  const canDelete = await hasPermission(PERMISSIONS.DELETE_REPORT)
  if (!canDelete) {
    return {
      success: false,
      error: "PERMISSION_DENIED",
    }
  }

  // 3. Delete record in database
  const supabase = await createServerClient()
  const { error } = await supabase
    .from("reports")
    .delete()
    .eq("id", idValidation.data)

  if (error) {
    return {
      success: false,
      error: "DELETE_REPORT_ERROR",
      details: { database: [error.message] },
    }
  }

  // 4. Invalidate related cache paths
  revalidatePath("/", "layout")

  return {
    success: true,
    data: null,
  }
}
