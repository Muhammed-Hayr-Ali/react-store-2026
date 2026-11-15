/**
 * @file lib/actions/categories/queries/get-categories.ts
 * @description Retrieves a single category by its slug with robust Next.js unstable_cache support.
 */

"use server"

import { unstable_cache } from "next/cache"
import { createServerClient } from "@/lib/database/supabase/server"
import type { ApiResult } from "../../types/utils"

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

// دالة الكاش الداخلية لتخزين بيانات التصنيف على مستوى الخادم
const getCachedCategoryBySlug = unstable_cache(
  async (slug: string): Promise<Category | null> => {
    const supabase = await createServerClient()

    const { data: categoryData, error } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .maybeSingle()

    if (error || !categoryData) {
      return null
    }

    return {
      id: categoryData.id,
      name: categoryData.name,
      name_ar: categoryData.name_ar,
      slug: categoryData.slug,
      description: categoryData.description,
      description_ar: categoryData.description_ar,
      image_url: categoryData.image_url,
      image_alt: categoryData.image_alt,
    }
  },
  ["category-by-slug-cache"],
  {
    revalidate: 3600, // ساعة كاملة
    tags: ["categories"], // مرتبطة بوسم التصنيفات لتحديثها فوراً عند التعديل
  }
)

export async function getCategoryBySlug(
  slug: string
): Promise<ApiResult<Category>> {
  if (!slug || typeof slug !== "string") {
    return {
      success: false,
      error: "INVALID_SLUG",
      details: { database: ["Category slug is required."] },
    }
  }

  try {
    const category = await getCachedCategoryBySlug(slug)

    if (!category) {
      return {
        success: false,
        error: "GET_CATEGORORY_ERROR",
        details: { database: [`No category found for slug: ${slug}`] },
      }
    }

    return { success: true, data: category }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown database error"

    return {
      success: false,
      error: "GET_CATEGORORY_ERROR",
      details: { database: [errorMessage] },
    }
  }
}