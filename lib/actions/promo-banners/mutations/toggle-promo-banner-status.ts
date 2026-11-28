"use server"

import { revalidatePath, revalidateTag } from "next/cache"

import { PERMISSIONS, hasPermission } from "@/lib/actions/role"
import { getValidationDetails } from "@/lib/actions/validation"
import type { ApiResult } from "@/lib/actions/types/utils"
import { CACHE_TAG } from "@/lib/config/app_config"
import { createServerClient } from "@/lib/database/supabase/server"

import {
  togglePromoBannerStatusSchema,
  type TogglePromoBannerStatusInput,
} from "../schemas"
import type { PromoBanner } from "../types"

export async function togglePromoBannerStatus(
  input: TogglePromoBannerStatusInput
): Promise<ApiResult<PromoBanner>> {
  const canManage = await hasPermission(PERMISSIONS.MANAGE_PROMO_BANNERS)
  if (!canManage) {
    return { success: false, error: "PROMO_BANNERS_PERMISSION_DENIED" }
  }

  const validation = togglePromoBannerStatusSchema.safeParse(input)
  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: getValidationDetails(validation.error),
    }
  }

  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from("promo_banners")
    .update({
      is_active: validation.data.is_active,
      updated_at: new Date().toISOString(),
    })
    .eq("id", validation.data.id)
    .select("*")
    .maybeSingle()

  if (error) {
    return {
      success: false,
      error: "UPDATE_PROMO_BANNER_ERROR",
      details: { database: [error.message] },
    }
  }

  if (!data) {
    return { success: false, error: "PROMO_BANNER_NOT_FOUND" }
  }

  revalidateTag(CACHE_TAG.PRODUCTS, { expire: 0 })
  revalidatePath("/", "layout")

  return { success: true, data }
}
