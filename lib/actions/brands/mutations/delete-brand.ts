/**
 * @file lib/actions/brands/mutations/delete-brand.ts
 * @description Deletes a brand.
 */

"use server"

import { revalidatePath, revalidateTag } from "next/cache"

import type { ApiResult } from "@/lib/actions/types/utils"
import { createServerClient } from "@/lib/database/supabase/server"

 import { getValidationDetails } from "../../validation"
import { brandIdSchema, type BrandIdInput } from "../schemas"
import { getTranslations } from "next-intl/server"
import { CACHE_TAG } from "@/lib/config/app_config"

export async function deleteBrand(
  input: BrandIdInput
): Promise<ApiResult<null>> {

  const t = await getTranslations("BrandsManagement")
  const validation = brandIdSchema.safeParse(input)
  if (!validation.success) {
    return {
      success: false,
      error: t("VALIDATION_ERROR"),
      details: getValidationDetails(validation.error),
    }
  }

  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from("brands")
    .delete()
    .eq("id", validation.data.id)
    .select("id")
    .maybeSingle()

  if (error) {
    return {
      success: false,
      error: "DELETE_BRAND_ERROR",
      details: { database: [error.message] },
    }
  }

  if (!data) {
    return { success: false, error: "BRAND_NOT_FOUND" }
  }


  revalidateTag(CACHE_TAG.BRANDS, { expire: 0 })
  revalidatePath("/", "layout")
  
  return { success: true, data: null }
}