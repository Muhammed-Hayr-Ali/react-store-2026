/**
 * @file lib/actions/store/product-details/queries/get-product-details.ts
 * @description Retrieves full product details including variants, filtering product images to variant-specific ones only safely.
 */

"use server"

import { cache } from "react"
import { createServerClient } from "@/lib/database/supabase/server"
import type { ApiResult } from "@/lib/actions/types/utils"

export interface ProductVariantDetail {
  id: string
  sku: string
  name: string
  price: number
  compare_at_price: number | null
  stock_quantity: number
  track_inventory: boolean
  is_active: boolean
  attributes: Record<string, string | number | boolean> | null
}

export interface ProductImageDetail {
  id: string
  url: string
  alt_text: string | null
  is_primary: boolean
  variant_sku: string | null
}

export interface CategoryDetail {
  id: string
  name: string
  name_ar: string | null
  slug: string
  parent_id: string | null
}

export interface BrandDetail {
  id: string
  name: string
  name_ar: string | null
  slug: string
  image_url?: string | null
  image_alt?: string | null
}

export interface FullProductDetails {
  id: string
  name: string
  slug: string
  description: string | null
  is_active: boolean
  is_featured: boolean
  created_at: string
  category: CategoryDetail | null
  parent_category: CategoryDetail | null
  brand: BrandDetail | null
  product_variants: ProductVariantDetail[]
  product_images: ProductImageDetail[]
  meta_title: string
  meta_description: string
}

interface DatabaseCategoryQueryResult {
  id: string
  name: string
  name_ar: string | null
  slug: string
  parent_id: string | null
}

interface DatabaseBrandQueryResult {
  id: string
  name: string
  name_ar: string | null
  slug: string
  image_url?: string | null
  image_alt?: string | null
}

interface DatabaseProductQueryResult {
  id: string
  name: string
  slug: string
  description: string | null
  is_active: boolean
  is_featured: boolean
  created_at: string
  meta_title: string
  meta_description: string
  category: DatabaseCategoryQueryResult[] | DatabaseCategoryQueryResult | null
  brand: DatabaseBrandQueryResult[] | DatabaseBrandQueryResult | null
  product_variants: ProductVariantDetail[] | null
  product_images: ProductImageDetail[] | null
}

export const getProductDetails = cache(
  async (slug: string): Promise<ApiResult<FullProductDetails>> => {
    if (!slug || typeof slug !== "string") {
      return {
        success: false,
        error: "INVALID_SLUG",
        details: { database: ["Product slug is required."] },
      }
    }

    const supabase = await createServerClient()

    const { data: productData, error } = await supabase
      .from("products")
      .select(
        `
      id,
      name,
      slug,
      description,
      is_active,
      is_featured,
      created_at,
      meta_title,
      meta_description,
      category:categories!products_category_id_fkey (
        id,
        name,
        name_ar,
        slug,
        parent_id
      ),
      brand:brands!products_brand_id_fkey (
        id,
        name,
        name_ar,
        slug,
        image_url,
        image_alt
      ),
      product_variants (
        id,
        sku,
        name,
        price,
        compare_at_price,
        stock_quantity,
        track_inventory,
        is_active,
        attributes
      ),
      product_images (
        id,
        url,
        alt_text,
        is_primary,
        variant_sku
      )
    `
      )
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle()

    if (error) {
      console.error("[getProductDetails] Database query failed", {
        slug,
        code: error.code,
        message: error.message,
      })
      return {
        success: false,
        error: "FETCH_PRODUCT_ERROR",
        details: { database: [error.message] },
      }
    }

    if (!productData) {
      return {
        success: false,
        error: "PRODUCT_NOT_FOUND",
        details: { database: [`No active product found for slug: ${slug}`] },
      }
    }

    const rawProduct = productData as unknown as DatabaseProductQueryResult

    // معالجة التصنيف
    let processedCategory: CategoryDetail | null = null
    if (rawProduct.category) {
      const cat = Array.isArray(rawProduct.category)
        ? rawProduct.category[0]
        : rawProduct.category

      if (cat) {
        processedCategory = {
          id: cat.id,
          name: cat.name,
          name_ar: cat.name_ar,
          slug: cat.slug,
          parent_id: cat.parent_id,
        }
      }
    }

    // إذا كان التصنيف يمتلك تصنيف أب (parent_id)، نقوم بجلبه بشكل مستقل وآمن
    let parentCategory: CategoryDetail | null = null
    if (processedCategory?.parent_id) {
      const { data: parentData } = await supabase
        .from("categories")
        .select("id, name, name_ar, slug, parent_id")
        .eq("id", processedCategory.parent_id)
        .maybeSingle()

      if (parentData) {
        parentCategory = parentData as CategoryDetail
      }
    }

    // معالجة العلامة التجارية (Brand)
    let processedBrand: BrandDetail | null = null
    if (rawProduct.brand) {
      const brd = Array.isArray(rawProduct.brand)
        ? rawProduct.brand[0]
        : rawProduct.brand

      if (brd) {
        processedBrand = {
          id: brd.id,
          name: brd.name,
          name_ar: brd.name_ar,
          slug: brd.slug,
          image_url: brd.image_url,
          image_alt: brd.image_alt,
        }
      }
    }

    // تصفية الصور برمجياً لضمان جلب الصور المرتبطة بمتغيرات فقط (حيث variant_sku ليس فارغاً أو null)
    const allImages = rawProduct.product_images ?? []
    const variantSpecificImages = allImages.filter(
      (img) => img.variant_sku !== null && img.variant_sku !== undefined && String(img.variant_sku).trim() !== ""
    )

    const formattedProduct: FullProductDetails = {
      id: rawProduct.id,
      name: rawProduct.name,
      slug: rawProduct.slug,
      description: rawProduct.description,
      is_active: rawProduct.is_active,
      is_featured: rawProduct.is_featured,
      meta_title: rawProduct.meta_title,
      meta_description: rawProduct.meta_description,
      created_at: rawProduct.created_at,
      category: processedCategory,
      parent_category: parentCategory,
      brand: processedBrand,
      product_variants: rawProduct.product_variants ?? [],
      product_images: variantSpecificImages, // استخدام الصور المصفاة للمتغيرات فقط
    }

    return { success: true, data: formattedProduct }
  }
)