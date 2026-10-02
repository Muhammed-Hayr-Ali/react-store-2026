"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"

export interface ActionResponse {
  success: boolean
  message?: string
  error?: string
}

export async function deleteFlashSale(saleId: string): Promise<ActionResponse> {
  const supabase = await createServerClient()

  // يتم حذف العناصر التابعة تلقائياً بسبب ON DELETE CASCADE في قاعدة البيانات
  const { error } = await supabase.from("flash_sales").delete().eq("id", saleId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/")
  revalidatePath("/admin/flash-sales")
  return { success: true, message: "Flash sale deleted successfully" }
}
