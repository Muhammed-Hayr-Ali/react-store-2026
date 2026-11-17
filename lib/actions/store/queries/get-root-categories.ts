/**
 * @file lib/actions/store/queries/get-store-root-categories.ts
 * @description Retrieves active root categories with specific concise fields ordered by sort_order with robust Next.js unstable_cache support.
 */

"use server"

import { unstable_cache } from "next/cache"
import type { ApiResult } from "../../types/utils"
import { createPublicServerClient } from "@/lib/database/supabase/public"
import { CACHE_TAG } from "@/lib/config/app_config"

export interface SimplifiedRootCategory {
  id: string
  name: string
  name_ar: string | null
  slug: string
  image_url: string | null
  image_alt: string | null
}

interface CategoryQueryResult {
  id: string
  name: string
  name_ar: string | null
  slug: string
  image_url: string | null
  image_alt: string | null
}

// دالة الكاش الداخلية تستقبل المعاملات بشكل مفرد لضمان استقرار الكاش
const getCachedRootCategories = unstable_cache(
  async (limit: number): Promise<SimplifiedRootCategory[]> => {
    const supabase = await createPublicServerClient()

    let query = supabase
      .from("categories")
      .select("id, name, name_ar, slug, image_url, image_alt")
      .eq("is_active", true)
      .is("parent_id", null)
      .order("sort_order", { ascending: true, nullsFirst: false })
      .order("name", { ascending: true })

    if (limit > 0) {
      query = query.limit(limit)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(error.message)
    }

    const rawCategories = (data ?? []) as unknown as CategoryQueryResult[]

    return rawCategories.map((category) => ({
      id: category.id,
      name: category.name,
      name_ar: category.name_ar,
      slug: category.slug,
      image_url: category.image_url,
      image_alt: category.image_alt,
    }))
  },

  ["categories"],
  {
    revalidate: 3600,
    tags: [CACHE_TAG.CATEGORIES],
  }
)

interface GetStoreRootCategoriesOptions {
  limit?: number
}

export async function getRootCategories(
  options: GetStoreRootCategoriesOptions = {}
): Promise<ApiResult<SimplifiedRootCategory[]>> {
  const { limit = 0 } = options

  try {
    const simplifiedCategories = await getCachedRootCategories(limit)

    return { success: true, data: simplifiedCategories }
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown database error"

    console.error("[getStoreRootCategories] Database query failed", {
      message: errorMessage,
    })

    return {
      success: false,
      error: "GET_STORE_CATEGORIES_ERROR",
      details: { database: [errorMessage] },
    }
  }
}
