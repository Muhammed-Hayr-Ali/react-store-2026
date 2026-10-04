/**
 * @file lib/actions/flash-sales/mutations/toggle-status.ts
 * @description Server Action to toggle the active flag of a flash sale.
 */

"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { hasPermission, PERMISSIONS } from "../../role"

// ============================================================================
// Main Action Function
// ============================================================================

export async function toggleFlashSaleStatus(
  saleId: string,
  isActive: boolean
): Promise<ApiResult<null>> {
  // 1. Permission check
  const canUpdate = await hasPermission(PERMISSIONS.UPDATE_FLASH_SALE)
  if (!canUpdate) {
    return {
      success: false,
      error: "PERMISSION_DENIED",
    }
  }

  const supabase = await createServerClient()

  // 2. Update status
  const { error } = await supabase
    .from("flash_sales")
    .update({ is_active: isActive })
    .eq("id", saleId)

  if (error) {
    return {
      success: false,
      error: "TOGGLE_STATUS_ERROR",
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
