"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { Brand } from "../types"

export async function getAllBrand(): Promise<ApiResult<Brand[]>> {
  // 1. Create a Supabase client for server-side operations.
  const supabase = await createServerClient()

  // 2. Build the base query with default ordering.
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .order("name", { ascending: true })

  if (error) {
    return {
      success: false,
      error: error.message || "FETCH_BRANDS_ERROR",
    }
  }

  return { success: true, data: data as Brand[] }
}
