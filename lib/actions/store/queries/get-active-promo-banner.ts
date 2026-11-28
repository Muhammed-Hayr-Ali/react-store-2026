/**
 * @file lib/actions/store/queries/get-active-promo-banner.ts
 * @description Retrieves the highest-priority active and currently scheduled promotional banner for the storefront.
 */

"use server"

import { unstable_cache } from "next/cache"
import type { ApiResult } from "../../types/utils"
import { createPublicServerClient } from "@/lib/database/supabase/public"
import { CACHE_TAG } from "@/lib/config/app_config"

export interface ActivePromoBanner {
  id: string
  title: string
  title_ar: string | null
  subtitle: string | null
  subtitle_ar: string | null
  badge_text: string | null
  badge_text_ar: string | null
  cta_label: string | null
  cta_label_ar: string | null
  cta_href: string | null
  image_url: string | null
  image_alt: string | null
  priority: number
  starts_at: string | null
  ends_at: string | null
}

const getCachedActivePromoBanner = unstable_cache(
  async (): Promise<ActivePromoBanner | null> => {
    const supabase = await createPublicServerClient()
    const nowIso = new Date().toISOString()

    const { data, error } = await supabase
      .from("promo_banners")
      .select(
        "id, title, title_ar, subtitle, subtitle_ar, badge_text, badge_text_ar, cta_label, cta_label_ar, cta_href, image_url, image_alt, priority, starts_at, ends_at"
      )
      .eq("is_active", true)
      .or(`starts_at.is.null,starts_at.lte.${nowIso}`)
      .or(`ends_at.is.null,ends_at.gt.${nowIso}`)
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      throw new Error(error.message)
    }

    return data ?? null
  },
  ["active-promo-banner-v1"],
  {
    revalidate: 300,
    tags: [CACHE_TAG.PRODUCTS],
  }
)

export async function getActivePromoBanner(): Promise<
  ApiResult<ActivePromoBanner | null>
> {
  try {
    const banner = await getCachedActivePromoBanner()
    return { success: true, data: banner }
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown database error"

    console.error("[getActivePromoBanner] Database query failed", {
      message: errorMessage,
    })

    return {
      success: false,
      error: "GET_ACTIVE_PROMO_BANNER_ERROR",
      details: { database: [errorMessage] },
    }
  }
}
