/**
 * @file lib/actions/store/queries/get-store-root-categories.ts
 * @description Retrieves active root categories with specific concise fields ordered by sort_order.
 */

"use server"

import { cache } from "react"
import type { ApiResult } from "../../types/utils"
import { createServerClient } from "@/lib/database/supabase/server"

// واجهة البيانات المبسطة المطلوبة حصرياً
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

interface GetStoreRootCategoriesOptions {
  limit?: number
}

export const getRootCategories = cache(
  async (
    options: GetStoreRootCategoriesOptions = {}
  ): Promise<ApiResult<SimplifiedRootCategory[]>> => {
    const { limit = 0 } = options

    const supabase = await createServerClient()

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
      console.error("[getStoreRootCategories] Database query failed", {
        code: error.code,
        message: error.message,
      })
      return {
        success: false,
        error: "GET_STORE_CATEGORIES_ERROR",
        details: { database: [error.message] },
      }
    }

    const rawCategories = (data ?? []) as unknown as CategoryQueryResult[]

    const simplifiedCategories: SimplifiedRootCategory[] = rawCategories.map(
      (category) => ({
        id: category.id,
        name: category.name,
        name_ar: category.name_ar,
        slug: category.slug,
        image_url: category.image_url,
        image_alt: category.image_alt,
      })
    )

    return { success: true, data: simplifiedCategories }
  }
)
