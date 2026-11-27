/**
 * @file lib/actions/store/queries/get-store-root-categories.ts
 * @description Retrieves active root categories along with their nested active subcategories ordered by sort_order with Next.js unstable_cache support.
 */

"use server"

import { unstable_cache } from "next/cache"
import type { ApiResult } from "../../types/utils"
import { createPublicServerClient } from "@/lib/database/supabase/public"
import { CACHE_TAG } from "@/lib/config/app_config"

export interface StoreSubcategory {
  id: string
  parent_id: string
  name: string
  name_ar: string | null
  slug: string
  image_url: string | null
  image_alt: string | null
}

export interface SimplifiedRootCategory {
  id: string
  name: string
  name_ar: string | null
  slug: string
  image_url: string | null
  image_alt: string | null
  subcategories: StoreSubcategory[]
}

const getCachedCategoriesTree = unstable_cache(
  async (limit: number): Promise<SimplifiedRootCategory[]> => {
    const supabase = await createPublicServerClient()

    const { data, error } = await supabase
      .from("categories")
      .select("id, parent_id, name, name_ar, slug, image_url, image_alt")
      .eq("is_active", true)
      .order("sort_order", { ascending: true, nullsFirst: false })
      .order("name", { ascending: true })

    if (error) {
      throw new Error(error.message)
    }

    const rawCategories = data ?? []

    // تجميع التصنيفات الفرعية حسب parent_id مع الحفاظ على ترتيب sort_order
    const childrenMap = new Map<string, StoreSubcategory[]>()
    const rootCategories: SimplifiedRootCategory[] = []

    for (const item of rawCategories) {
      if (item.parent_id) {
        const siblings = childrenMap.get(item.parent_id) ?? []
        siblings.push({
          id: item.id,
          parent_id: item.parent_id,
          name: item.name,
          name_ar: item.name_ar,
          slug: item.slug,
          image_url: item.image_url,
          image_alt: item.image_alt,
        })
        childrenMap.set(item.parent_id, siblings)
      }
    }

    for (const item of rawCategories) {
      if (!item.parent_id) {
        rootCategories.push({
          id: item.id,
          name: item.name,
          name_ar: item.name_ar,
          slug: item.slug,
          image_url: item.image_url,
          image_alt: item.image_alt,
          subcategories: childrenMap.get(item.id) ?? [],
        })
      }
    }

    if (limit > 0) {
      return rootCategories.slice(0, limit)
    }

    return rootCategories
  },
  ["categories-tree"],
  {
    revalidate: 3600,
    tags: [CACHE_TAG.CATEGORIES],
  }
)

interface GetStoreRootCategoriesOptions {
  limit?: number
}

export async function getAllCategories(
  options: GetStoreRootCategoriesOptions = {}
): Promise<ApiResult<SimplifiedRootCategory[]>> {
  const { limit = 0 } = options

  try {
    const categoriesTree = await getCachedCategoriesTree(limit)

    return { success: true, data: categoriesTree }
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown database error"

    console.error("[getAllCategories] Database query failed", {
      message: errorMessage,
    })

    return {
      success: false,
      error: "GET_STORE_CATEGORIES_ERROR",
      details: { database: [errorMessage] },
    }
  }
}