/**
 * @file lib/actions/brands/queries/get-brands-summary.ts
 * @description Retrieves aggregate counts for the brands dashboard summary.
 */

"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import type { ApiResult } from "@/lib/actions/types/utils"
import type { BrandsSummary } from "../types"

export async function getBrandsSummary(): Promise<ApiResult<BrandsSummary>> {
  const supabase = await createServerClient()
  const { data, error } = await supabase.from("brands").select("is_active")

  if (error) {
    return {
      success: false,
      error: "GET_BRANDS_ERROR",
      details: { database: [error.message] },
    }
  }

  const brands = (data ?? []) as Array<{ is_active: boolean }>
  const active = brands.filter((brand) => brand.is_active).length

  return {
    success: true,
    data: {
      total: brands.length,
      active,
      inactive: brands.length - active,
    },
  }
}
