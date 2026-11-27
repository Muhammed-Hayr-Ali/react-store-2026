/**
 * @file lib/actions/brands/mutations/create-brand.ts
 * @description Creates a brand after permission and input checks.
 */

"use server"

import { revalidatePath, revalidateTag } from "next/cache"

import type { ApiResult } from "@/lib/actions/types/utils"
import { createServerClient } from "@/lib/database/supabase/server"

import { getValidationDetails } from "../../validation"
import { brandSchema, type BrandFormValues } from "../schemas"
import type { BrandRecord } from "../types"
import { getTranslations } from "next-intl/server"
import { CACHE_TAG } from "@/lib/config/app_config"

export async function createBrand(
  input: BrandFormValues
): Promise<ApiResult<BrandRecord>> {
  const t = await getTranslations("BrandsManagement")

  const validation = brandSchema.safeParse(input)
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
    .insert({
      ...validation.data,
      image_url: validation.data.image_url || null,
    })
    .select("*")
    .single()

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
      error: "CREATE_BRAND_ERROR",
      details: { database: [error.message] },
    }
  }

  revalidateTag(CACHE_TAG.BRANDS, { expire: 0 })
  revalidatePath("/", "layout")
  
  return { success: true, data }
}
