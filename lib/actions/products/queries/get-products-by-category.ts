"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import {
  getProductsByCategorySchema,
  GetProductsByCategoryOptions,
  CategoryProductItem,
  RawCategoryProductQueryResult,
} from "../types"

/**
 * جلب المنتجات التابعة لتصنيف محدد (بواسطة الـ Slug أو الـ ID)
 * مع إعطاء الأولوية دائماً للمنتجات المتميزة (is_featured = true) ثم الأحدث تاريخاً
 */
export async function getProductsByCategory(
  options: GetProductsByCategoryOptions
): Promise<ApiResult<CategoryProductItem[]>> {
  // 1. التحقق من المدخلات
  const validation = getProductsByCategorySchema.safeParse(options)
  if (!validation.success) {
    return {
      success: false,
      error: "INVALID_PARAMETERS",
    }
  }

  const { categorySlug, categoryId, limit, activeOnly } = validation.data

  try {
    const supabase = await createServerClient()

    let resolvedCategoryId = categoryId

    // في حال تم التمرير عبر slug التصنيف، يتم جلب معرف التصنيف أولاً
    if (!resolvedCategoryId && categorySlug) {
      const { data: categoryData, error: catError } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", categorySlug)
        .maybeSingle()

      if (catError || !categoryData) {
        return {
          success: false,
          error: "CATEGORY_NOT_FOUND",
          details: { database: [catError?.message || "Category not found"] },
        }
      }

      resolvedCategoryId = categoryData.id
    }

    // 2. بناء استعلام المنتجات للتصنيف
    let query = supabase
      .from("products")
      .select(
        `
        id,
        name,
        slug,
        description,
        is_featured,
        created_at,
        brand:brands!products_brand_id_fkey (name),
        category:categories!products_category_id_fkey (name, slug),
        product_variants (price, is_active),
        product_images (url, is_primary)
      `
      )
      .eq("category_id", resolvedCategoryId!)
      // الترتيب: المتميز أولاً، ثم الأحدث تاريخاً
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit)

    if (activeOnly) {
      query = query.eq("is_active", true)
    }

    const { data, error } = await query

    if (error) {
      console.error("❌ [GetProductsByCategory] Database error:", error.message)
      return {
        success: false,
        error: "FETCH_CATEGORY_PRODUCTS_ERROR",
        details: { database: [error.message] },
      }
    }

    const rawProducts = (data ||
      []) as unknown as RawCategoryProductQueryResult[]

    // 3. استخراج الأسعار الأقل والصور التابعة
    const formattedProducts: CategoryProductItem[] = rawProducts.map((prod) => {
      const activeVariants = (prod.product_variants || []).filter(
        (v) => v.is_active
      )
      const prices = activeVariants.map((v) => Number(v.price))
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0

      const images = prod.product_images || []
      const primaryImg =
        images.find((img) => img.is_primary)?.url || images[0]?.url || null

      return {
        id: prod.id,
        name: prod.name,
        slug: prod.slug,
        description: prod.description,
        is_featured: prod.is_featured,
        created_at: prod.created_at,
        min_price: minPrice,
        primary_image_url: primaryImg,
        brand_name: prod.brand?.name || null,
        category_name: prod.category?.name || null,
        category_slug: prod.category?.slug || null,
      }
    })

    return {
      success: true,
      data: formattedProducts,
    }
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Unexpected error occurred"

    console.error("❌ [GetProductsByCategory] Unexpected Error:", errorMessage)
    return {
      success: false,
      error: "UNEXPECTED_ERROR",
      details: { database: [errorMessage] },
    }
  }
}
