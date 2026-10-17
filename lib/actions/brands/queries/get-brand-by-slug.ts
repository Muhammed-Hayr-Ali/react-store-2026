/**
 * @file lib/actions/brands/queries/get-brand-by-slug.ts
 * @description Retrieves an active brand by its public URL slug.
 */

"use server"

import type { ApiResult } from "@/lib/actions/types/utils"
import { createServerClient } from "@/lib/database/supabase/server"

import { getValidationDetails } from "../../validation"
import { brandSlugSchema, type BrandSlugInput } from "../schemas"
import type { BrandRecord } from "../types"

/**
 * تجلب علامة تجارية نشطة باستخدام رابطها العام.
 */
export async function getBrandBySlug(
  input: BrandSlugInput
): Promise<ApiResult<BrandRecord>> {
  const validation = brandSlugSchema.safeParse(input)
  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: getValidationDetails(validation.error),
    }
  }

  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .eq("slug", validation.data.slug)
    .eq("is_active", true)
    .maybeSingle()

  if (error) {
    return {
      success: false,
      error: "GET_BRAND_ERROR",
      details: { database: [error.message] },
    }
  }

  if (!data) {
    return { success: false, error: "BRAND_NOT_FOUND" }
  }

  return { success: true, data: data as BrandRecord }
}