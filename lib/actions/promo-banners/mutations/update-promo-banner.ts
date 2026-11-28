"use server"

import { revalidatePath, revalidateTag } from "next/cache"

import { PERMISSIONS, hasPermission } from "@/lib/actions/role"
import { getValidationDetails } from "@/lib/actions/validation"
import type { ApiResult } from "@/lib/actions/types/utils"
import { CACHE_TAG } from "@/lib/config/app_config"
import { createServerClient } from "@/lib/database/supabase/server"

import {
  updatePromoBannerSchema,
  type UpdatePromoBannerInput,
} from "../schemas"
import type { PromoBanner } from "../types"

export async function updatePromoBanner(
  input: UpdatePromoBannerInput
): Promise<ApiResult<PromoBanner>> {
  const canManage = await hasPermission(PERMISSIONS.MANAGE_PROMO_BANNERS)
  if (!canManage) {
    return { success: false, error: "PROMO_BANNERS_PERMISSION_DENIED" }
  }

  const validation = updatePromoBannerSchema.safeParse(input)
  if (!validation.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      details: getValidationDetails(validation.error),
    }
  }

  const { id, ...values } = validation.data
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from("promo_banners")
    .update({ ...values, updated_at: new Date().toISOString() })
    .eq("id", id)
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
