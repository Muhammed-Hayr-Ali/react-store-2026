/**
 * @file lib/actions/flash-sales/mutations/delete.ts
 * @description Server Action to permanently remove a flash sale campaign and its cascading items.
 */

"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"

// ============================================================================
// Main Action Function
// ============================================================================

export async function deleteFlashSale(
  saleId: string
): Promise<ApiResult<null>> {
  const supabase = await createServerClient()

  // Foreign key cascade cleans up flash_sale_items automatically
  const { error } = await supabase.from("flash_sales").delete().eq("id", saleId)

  if (error) {
    return {
      success: false,
      error: "DELETE_FLASH_SALE_ERROR",
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
