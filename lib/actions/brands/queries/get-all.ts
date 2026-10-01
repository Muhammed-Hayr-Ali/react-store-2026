"use server"

import { z } from "zod"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { Brand, brandSchema } from "../types"

export async function getAllBrand(): Promise<ApiResult<Brand[]>> {
  // 1. Initialize Supabase client
  const supabase = await createServerClient()

  // 2. Query brands sorted by name
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .order("name", { ascending: true })

  if (error) {
    return {
      success: false,
      error: "FETCH_BRANDS_ERROR",
      details: { database: [error.message] },
    }
  }

  // 3. Schema verification on list of records
  const parsedData = z.array(brandSchema).safeParse(data || [])
  if (!parsedData.success) {
    console.error("Database data mismatch in getAllBrand:", parsedData.error)
    return {
      success: false,
      error: "DATA_VALIDATION_ERROR",
    }
  }

  return { success: true, data: parsedData.data }
}
