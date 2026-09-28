"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { Product } from "../types"

/**
 * جلب منتج واحد بالمعرف (بدون المتغيرات والصور للأداء السريع)
 */
export async function getProductById(
  id: string
): Promise<ApiResult<Product | null>> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return { success: false, error: "PRODUCT_NOT_FOUND" }
    }
    return {
      success: false,
      error: "FETCH_PRODUCT_ERROR",
      details: { database: [error.message] },
    }
  }

  return { success: true, data: data as Product }
}
