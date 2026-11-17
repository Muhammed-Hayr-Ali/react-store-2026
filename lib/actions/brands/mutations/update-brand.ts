/**
 * @file lib/actions/brands/mutations/update-brand.ts
 * @description Replaces a brand after permission checks.
 */

"use server"

import { revalidatePath, revalidateTag } from "next/cache"

import type { ApiResult } from "@/lib/actions/types/utils"
import { createServerClient } from "@/lib/database/supabase/server"

import { getValidationDetails } from "../../validation"
import { updateBrandSchema, type UpdateBrandInput } from "../schemas"
import type { BrandRecord } from "../types"
import { getTranslations } from "next-intl/server"
import { CACHE_TAG } from "@/lib/config/app_config"

export async function updateBrand(
  input: UpdateBrandInput
): Promise<ApiResult<BrandRecord>> {
  const t = await getTranslations("BrandsManagement")

  const validation = updateBrandSchema.safeParse(input)
  if (!validation.success) {
    return {
      success: false,
      error: t("VALIDATION_ERROR"),
      details: getValidationDetails(validation.error),
    }
  }

  const { id, ...brand } = validation.data

  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("brands")
    .update({
      ...brand,
      image_url: brand.image_url || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .maybeSingle()

  if (error) {
    if (
      error.code === "23505" &&
      error.message.toLowerCase().includes("slug")
    ) {
      return {
        success: false,
        error: "BRAND_SLUG_ALREADY_EXISTS",
        details: { database: [error.message] },
      }
    }

    return {
      success: false,
      error: "UPDATE_BRAND_ERROR",
      details: { database: [error.message] },
    }
  }

  if (!data) {
    return { success: false, error: "BRAND_NOT_FOUND" }
  }


  revalidateTag(CACHE_TAG.BRANDS, { expire: 0 })
  revalidatePath("/", "layout")
  
  return { success: true, data: data as BrandRecord }
}
