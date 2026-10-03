/**
 * @file lib/actions/brands/mutations/delete.ts
 * @description Server Action to permanently remove a brand record by UUID.
 * Enforces parameter format verification, administrator authorization, and cache clearing.
 */

"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { hasRole, hasPermission, ROLES, PERMISSIONS } from "../../role"

// ============================================================================
// Main Action
// ============================================================================

export async function deleteBrand(id: string): Promise<ApiResult<null>> {
  // 1. Validate ID format
  const idValidation = z.string().uuid("INVALID_ID").safeParse(id)
  if (!idValidation.success) {
    return {
      success: false,
      error: "INVALID_ID",
    }
  }

  // 2. Perform parallel authorization checks using typed constants
  const [isAdmin, canDelete] = await Promise.all([
    hasRole(ROLES.ADMIN),
    hasPermission(PERMISSIONS.DELETE_BRAND),
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

  // 3. Initialize Supabase client
  const supabase = await createServerClient()

  // 4. Delete record from database
  const { error } = await supabase.from("brands").delete().eq("id", id)

  if (error) {
    return {
      success: false,
      error: "DELETE_BRAND_ERROR",
      details: { database: [error.message] },
    }
  }

  // 5. Invalidate stale cache paths (المتجر واللوحة بالكامل)
  revalidatePath("/", "layout")

  return {
    success: true,
    data: null,
  }
}
