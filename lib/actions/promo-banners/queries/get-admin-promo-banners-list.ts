"use server"

import type { ApiResult } from "@/lib/actions/types/utils"
import { PERMISSIONS, hasPermission } from "@/lib/actions/role"
import { createServerClient } from "@/lib/database/supabase/server"

import type { AdminPromoBannerSummary } from "../types"

export async function getAdminPromoBannersList(): Promise<
  ApiResult<AdminPromoBannerSummary[]>
> {
  const canView = await hasPermission(
    PERMISSIONS.VIEW_PROMO_BANNERS_DASHBOARD
  )
  if (!canView) {
    return { success: false, error: "PROMO_BANNERS_PERMISSION_DENIED" }
  }

  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from("promo_banners")
    .select(
      "id, title, title_ar, subtitle, subtitle_ar, badge_text, badge_text_ar, cta_label, cta_label_ar, cta_href, image_url, image_alt, priority, is_active, starts_at, ends_at, created_at, updated_at"
    )
    .order("priority", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) {
    return {
      success: false,
      error: "GET_ADMIN_PROMO_BANNERS_ERROR",
      details: { database: [error.message] },
    }
  }

  return { success: true, data: data ?? [] }
}
