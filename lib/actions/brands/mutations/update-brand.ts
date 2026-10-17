/**
 * @file lib/actions/brands/mutations/update-brand.ts
 * @description Replaces a brand after permission checks.
 */

"use server"

import { revalidatePath } from "next/cache"

import type { ApiResult } from "@/lib/actions/types/utils"
import { createServerClient } from "@/lib/database/supabase/server"

import { hasPermission, PERMISSIONS } from "../../role"
import { getValidationDetails } from "../../validation"
import { updateBrandSchema, type UpdateBrandInput } from "../schemas"
import type { BrandRecord } from "../types"

/**
 * تحدث بيانات علامة تجارية بعد التحقق من الصلاحية.
 */
export async function updateBrand(
  input: UpdateBrandInput
): Promise<ApiResult<BrandRecord>> {
  const canUpdate = await hasPermission(PERMISSIONS.UPDATE_BRAND)
  if (!canUpdate) {
    return { success: false, error: "PERMISSION_DENIED" }
  }

  const validation = updateBrandSchema.safeParse(input)
  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
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

  revalidatePath("/", "layout")
  return { success: true, data: data as BrandRecord }
}