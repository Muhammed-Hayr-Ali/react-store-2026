/**
 * @file lib/actions/store/queries/get-category-data.ts
 * @description Retrieves a single category by its id or slug with robust Next.js unstable_cache support.
 */

"use server"

import { unstable_cache } from "next/cache"
import type { ApiResult } from "@/lib/actions/types/utils"
import { createPublicServerClient } from "@/lib/database/supabase/public"
import { CACHE_TAG } from "@/lib/config/app_config"

export interface SimpliCategory {
  id: string
  slug: string
  name: string
  name_ar?: string
  description?: string | null
  description_ar?: string | null
}

interface FilterOptions {
  categoryId?: string
  categorySlug?: string
}

// دالة الكاش الداخلية تستقبل بارامترات مفردة (Primitives) لضمان استقرار مفتاح الكاش وثباته
const getCachedCategoryByFilter = unstable_cache(
  async (
    categoryId?: string,
    categorySlug?: string
  ): Promise<SimpliCategory | null> => {
    const supabase = await createPublicServerClient()

    let query = supabase.from("categories").select(
      `
      id,
      slug,
      name,
      name_ar,
      description,
      description_ar
    `
    )

    if (categoryId) {
      query = query.eq("id", categoryId)
    }

    if (categorySlug) {
      query = query.eq("slug", categorySlug)
    }

    const { data, error } = await query.maybeSingle()

    if (error) {
      throw new Error(error.message)
    }

    return (data as SimpliCategory) || null
  },
  
  ["categories"],
  {
    revalidate: 3600,
    tags: [CACHE_TAG.CATEGORIES],
  }
)

export async function getCategoryByFilter(
  options: FilterOptions = {}
): Promise<ApiResult<SimpliCategory | null>> {
  const { categoryId, categorySlug } = options

  if (!categoryId && !categorySlug) {
    return {
      success: false,
      error: "MISSING_FILTER",
      details: {
        database: ["You must provide either categoryId or categorySlug"],
      },
    }
  }

  try {
    const category = await getCachedCategoryByFilter(categoryId, categorySlug)

    return { success: true, data: category }
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown database error"

    return {
      success: false,
      error: "GET_CATEGORY_ERROR",
      details: { database: [errorMessage] },
    }
  }
}
