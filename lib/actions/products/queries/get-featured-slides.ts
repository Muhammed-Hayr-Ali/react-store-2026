"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { FeaturedProductSlide } from "../types"

interface GetFeaturedSlidesOptions {
  limit?: number
}

// 1. تعريف واجهات الأنواع بدقة لمنع استخدام any
interface RawProductVariant {
  price: number
  is_active: boolean
}

interface RawProductImage {
  url: string
  is_primary: boolean
}

interface RawBrand {
  name: string
}

interface RawFeaturedProduct {
  id: string
  name: string
  slug: string
  description: string | null
  brand: RawBrand | null
  product_variants: RawProductVariant[] | null
  product_images: RawProductImage[] | null
}

/**
 * جلب قائمة المنتجات المتميزة بشكل مختصر ومخصص للسلايد شو
 */
export async function getFeaturedProductSlides(
  options: GetFeaturedSlidesOptions = {}
): Promise<ApiResult<FeaturedProductSlide[]>> {
  const { limit = 5 } = options

  try {
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from("products")
      .select(
        `
        id,
        name,
        slug,
        description,
        brand:brands!products_brand_id_fkey (name),
        product_variants (price, is_active),
        product_images (url, is_primary)
      `
      )
      .eq("is_active", true)
      .eq("is_featured", true)
      .limit(limit)

    if (error) {
      console.error("❌ [GetFeaturedProductSlides] Error:", error.message)
      return {
        success: false,
        error: "FETCH_FEATURED_PRODUCTS_ERROR",
        details: { database: [error.message] },
      }
    }

    const rawProducts = (data || []) as unknown as RawFeaturedProduct[]

    // تنقيح وتحويل البيانات مع فحص الأنواع الصارم (Strict Type Narrowing)
    const slides: FeaturedProductSlide[] = rawProducts.map((prod) => {
      // 1. حساب أقل سعر بين المتغيرات المفعّلة
      const activeVariants = (prod.product_variants || []).filter(
        (v) => v.is_active
      )
      const prices = activeVariants.map((v) => Number(v.price))
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0

      // 2. استخراج الصورة الأساسية أو أول صورة متوفرة
      const images = prod.product_images || []
      const primaryImg =
        images.find((img) => img.is_primary)?.url || images[0]?.url || null

      return {
        id: prod.id,
        name: prod.name,
        slug: prod.slug,
        description: prod.description,
        min_price: minPrice,
        primary_image_url: primaryImg,
        brand_name: prod.brand?.name || null,
      }
    })

    return {
      success: true,
      data: slides,
    }
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error occurred"

    console.error(
      "❌ [GetFeaturedProductSlides] Unexpected Error:",
      errorMessage
    )
    return {
      success: false,
      error: "UNEXPECTED_ERROR",
      details: { database: [errorMessage] },
    }
  }
}
