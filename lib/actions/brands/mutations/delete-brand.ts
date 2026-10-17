/**
 * @file lib/actions/brands/mutations/delete-brand.ts
 * @description Deletes a brand.
 */

"use server"

import { revalidatePath } from "next/cache"

import type { ApiResult } from "@/lib/actions/types/utils"
import { createServerClient } from "@/lib/database/supabase/server"

import { hasPermission, PERMISSIONS } from "../../role"
import { getValidationDetails } from "../../validation"
import { brandIdSchema, type BrandIdInput } from "../schemas"

/**
 * تحذف علامة تجارية بعد التحقق من الصلاحية ووجودها.
 */
export async function deleteBrand(
  input: BrandIdInput
): Promise<ApiResult<null>> {
  const canDelete = await hasPermission(PERMISSIONS.DELETE_BRAND)
  if (!canDelete) {
    return { success: false, error: "PERMISSION_DENIED" }
  }

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

  revalidatePath("/", "layout")
  return { success: true, data: null }
}