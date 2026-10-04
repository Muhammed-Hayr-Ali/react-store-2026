/**
 * @file lib/actions/flash-sales/mutations/delete.ts
 * @description Server Action to permanently remove a flash sale campaign and its cascading items.
 */

"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { hasPermission, PERMISSIONS } from "../../role"

// ============================================================================
// Main Action Function
// ============================================================================

export async function deleteFlashSale(
  saleId: string
): Promise<ApiResult<null>> {
  // 1. Permission check
  const canDelete = await hasPermission(PERMISSIONS.DELETE_FLASH_SALE)
  if (!canDelete) {
    return {
      success: false,
      error: "PERMISSION_DENIED",
    }
  }

  const supabase = await createServerClient()

  // 2. Delete record (foreign key cascade handles items)
  const { error } = await supabase.from("flash_sales").delete().eq("id", saleId)

  if (error) {
    return {
      success: false,
      error: "DELETE_FLASH_SALE_ERROR",
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
