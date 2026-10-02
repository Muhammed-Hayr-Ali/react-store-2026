"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import {
  getProductsByBrandSchema,
  GetProductsByBrandOptions,
  BrandProductItem,
  RawBrandProductQueryResult,
} from "../types"

/**
 * جلب المنتجات التابعة لماركة تجارية محددة (بواسطة الـ Slug أو الـ ID)
 * مع إعطاء الأولوية دائماً للمنتجات المتميزة (is_featured = true) ثم الأحدث تاريخاً
 */
export async function getProductsByBrand(
  options: GetProductsByBrandOptions
): Promise<ApiResult<BrandProductItem[]>> {
  // 1. التحقق من صحة المدخلات
  const validation = getProductsByBrandSchema.safeParse(options)
  if (!validation.success) {
    return {
      success: false,
      error: "INVALID_PARAMETERS",
    }
  }

  const { brandSlug, brandId, limit, activeOnly } = validation.data

  try {
    const supabase = await createServerClient()

    let resolvedBrandId = brandId

    // في حال تم التمرير عبر slug الماركة، يتم جلب معرف الماركة أولاً
    if (!resolvedBrandId && brandSlug) {
      const { data: brandData, error: brandError } = await supabase
        .from("brands")
        .select("id")
        .eq("slug", brandSlug)
        .maybeSingle()

      if (brandError || !brandData) {
        return {
          success: false,
          error: "BRAND_NOT_FOUND",
          details: { database: [brandError?.message || "Brand not found"] },
        }
      }

      resolvedBrandId = brandData.id
    }

    // 2. بناء استعلام المنتجات للماركة
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
        brand:brands!products_brand_id_fkey (name, slug),
        category:categories!products_category_id_fkey (name, slug),
        product_variants (price, is_active),
        product_images (url, is_primary)
      `
      )
      .eq("brand_id", resolvedBrandId!)
      // الترتيب: المتميز أولاً، ثم الأحدث تاريخاً
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit)

    if (activeOnly) {
      query = query.eq("is_active", true)
    }

    const { data, error } = await query

    if (error) {
      console.error("❌ [GetProductsByBrand] Database error:", error.message)
      return {
        success: false,
        error: "FETCH_BRAND_PRODUCTS_ERROR",
        details: { database: [error.message] },
      }
    }

    const rawProducts = (data || []) as unknown as RawBrandProductQueryResult[]

    // 3. تنسيق النتائج، استخراج السعر الأقل، والصورة الأساسية
    const formattedProducts: BrandProductItem[] = rawProducts.map((prod) => {
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
        brand_slug: prod.brand?.slug || null,
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

    console.error("❌ [GetProductsByBrand] Unexpected Error:", errorMessage)
    return {
      success: false,
      error: "UNEXPECTED_ERROR",
      details: { database: [errorMessage] },
    }
  }
}
