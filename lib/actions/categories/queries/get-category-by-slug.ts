/**
 * @file lib/actions/categories/queries/get-categories.ts
 * @description Retrieves categories in display order with optional management filters.
 */

"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import { cache } from "react"
import { ApiResult } from "../../types/utils"

export type Category = {
  id: string
  name: string
  name_ar: string | null
  slug: string

  description: string | null
  description_ar: string | null
  image_alt: string | null
  image_url: string | null
}

export const getCategoryBySlug = cache(
  async (slug: string): Promise<ApiResult<Category>> => {
    const supabase = await createServerClient()

    const { data: categoryData, error } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .single()
    if (error || !categoryData) {
      return {
        success: false,
        error: "GET_CATEGORORY_ERROR",
      }
    }

    // const product = productData as unknown as ProductWithRelations

    const category = {
      id: categoryData.id,
      name: categoryData.name,
      name_ar: categoryData.name_ar,
      slug: categoryData.slug,

      description: categoryData.description,
      description_ar: categoryData.description_ar,
      image_url: categoryData.image_url,
      image_alt: categoryData.image_alt,
    }

    return { success: true, data: category as Category }
  }
)
