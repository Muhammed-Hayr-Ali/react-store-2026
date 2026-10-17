/**
 * @file lib/actions/brands/queries/get-brand-by-id.ts
 * @description Retrieves one brand for brand-management workflows.
 */

"use server"

import type { ApiResult } from "@/lib/actions/types/utils"
import { createServerClient } from "@/lib/database/supabase/server"

import { getValidationDetails } from "../../validation"
import { brandIdSchema, type BrandIdInput } from "../schemas"
import type { BrandRecord } from "../types"

/**
 * تجلب علامة تجارية واحدة لإدارة العلامات التجارية بعد التحقق من الصلاحية.
 */
export async function getBrandById(
  input: BrandIdInput
): Promise<ApiResult<BrandRecord>> {


  const validation = brandIdSchema.safeParse(input)
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
    .eq("id", validation.data.id)
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