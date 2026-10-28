/**
 * @file lib/actions/brands/queries/get-brands.ts
 * @description Retrieves brands in display order with optional management filters.
 */

"use server"

import type { ApiResult } from "@/lib/actions/types/utils"
import { createServerClient } from "@/lib/database/supabase/server"

import { getValidationDetails } from "../../validation"
import { getBrandsSchema, type GetBrandsInput } from "../schemas"
import type { BrandRecord } from "../types"

export async function getBrands(
  input: GetBrandsInput = {}
): Promise<ApiResult<BrandRecord[]>> {
  const validation = getBrandsSchema.safeParse(input)
  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: getValidationDetails(validation.error),
    }
  }

  const { includeInactive } = validation.data

  const supabase = await createServerClient()
  let query = supabase
    .from("brands")
    .select("*")
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("name", { ascending: true })

  if (!includeInactive) {
    query = query.eq("is_active", true)
  }

  const { data, error } = await query

  if (error) {
    return {
      success: false,
      error: "GET_BRANDS_ERROR",
      details: { database: [error.message] },
    }
  }

  return { success: true, data: (data ?? []) as BrandRecord[] }
}