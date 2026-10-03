/**
 * @file lib/actions/flash-sales/mutations/toggle-status.ts
 * @description Server Action to toggle the active flag of a flash sale.
 */

"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"

// ============================================================================
// Main Action Function
// ============================================================================

export async function toggleFlashSaleStatus(
  saleId: string,
  isActive: boolean
): Promise<ApiResult<null>> {
  const supabase = await createServerClient()

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

  revalidatePath("/")
  revalidatePath("/admin/flash-sales")

  return {
    success: true,
    data: null,
  }
}
