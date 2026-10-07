/**
 * @file lib/actions/flash-sales/mutations/toggle-status.ts
 * @description Server Action to toggle the active flag of a flash sale.
 */

"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { hasPermission, PERMISSIONS } from "../../role"

export async function toggleFlashSaleStatus(
  saleId: string,
  isActive: boolean
): Promise<ApiResult<null>> {
  const idValidation = z.string().uuid("INVALID_SALE_ID").safeParse(saleId)
  if (!idValidation.success) {
    return { success: false, error: "INVALID_SALE_ID" }
  }

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
    .eq("id", idValidation.data)

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
