"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"

export interface ActionResponse {
  success: boolean
  message?: string
  error?: string
}

export async function toggleFlashSaleStatus(
  saleId: string,
  isActive: boolean
): Promise<ActionResponse> {
  const supabase = await createServerClient()

  const { error } = await supabase
    .from("flash_sales")
    .update({ is_active: isActive })
    .eq("id", saleId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/")
  revalidatePath("/admin/flash-sales")
  return { success: true, message: "Flash sale status updated" }
}
