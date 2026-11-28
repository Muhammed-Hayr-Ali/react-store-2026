/**
 * @file lib/actions/store/queries/get-brand-data.ts
 * @description Retrieves a single brand by its id or slug with robust Next.js unstable_cache support.
 */

"use server"

import { unstable_cache } from "next/cache"
import type { ApiResult } from "@/lib/actions/types/utils"
import { createServerClient } from "@/lib/database/supabase/server"
import { CACHE_TAG } from "@/lib/config/app_config"
import type { Tables } from "@/lib/database/supabase/database.types"

export type SimpliBrand = Pick<
  Tables<"brands">,
  "id" | "slug" | "name" | "name_ar" | "description" | "description_ar"
>

interface FilterOptions {
  brandId?: string
  brandSlug?: string
}

// دالة الكاش الداخلية تستقبل بارامترات مفردة (Primitives) لضمان استقرار مفتاح الكاش وثباته
export const getCachedBrandByFilter = unstable_cache(
  async (brandId?: string, brandSlug?: string): Promise<SimpliBrand | null> => {
    const supabase = await createServerClient()

    let query = supabase.from("brands").select(
      `
      id,
      slug,
      name,
      name_ar,
      description,
      description_ar
    `
    )

    if (brandId) {
      query = query.eq("id", brandId)
    }

    if (brandSlug) {
      query = query.eq("slug", brandSlug)
    }

    const { data, error } = await query.maybeSingle()

    if (error) {
      throw new Error(error.message)
    }

    return data
  },

  ["brands"],
  {
    revalidate: 3600,
    tags: [CACHE_TAG.BRANDS],
  }
)

export async function getBrandByFilter(
  options: FilterOptions = {}
): Promise<ApiResult<SimpliBrand | null>> {
  const { brandId, brandSlug } = options

  if (!brandId && !brandSlug) {
    return {
      success: false,
      error: "MISSING_FILTER",
      details: { database: ["You must provide either brandId or brandSlug"] },
    }
  }

  try {
    const brand = await getCachedBrandByFilter(brandId, brandSlug)

    return { success: true, data: brand }
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown database error"

    return {
      success: false,
      error: "GET_BRAND_ERROR",
      details: { database: [errorMessage] },
    }
  }
}
