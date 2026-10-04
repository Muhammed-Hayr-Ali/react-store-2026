/**
 * @file lib/actions/products/queries/get-complete-by-slug.ts
 * @description Retrieves a full product with all related variants, images, and active flash sale data by slug.
 */

"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import type { ProductWithRelations } from "../types"

interface GetProductOptions {
  activeOnly?: boolean
}

export interface FlashSaleDeal {
  id: string
  discount_percentage: number
  sale_price: number | null
  end_time: string
}

export type ProductWithFlashSale = ProductWithRelations & {
  flash_sale_deal?: FlashSaleDeal | null
}

export async function getProductCompleteBySlug(
  slug: string,
  options: GetProductOptions = {}
): Promise<ApiResult<ProductWithFlashSale>> {
  const { activeOnly = true } = options

  if (!slug || typeof slug !== "string") {
    return {
      success: false,
      error: "INVALID_SLUG",
      details: { database: ["Product slug is required."] },
    }
  }

  const supabase = await createServerClient()
  const now = new Date().toISOString()

  let query = supabase
    .from("products")
    .select(
      `
      *,
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
        logo_url
      ),
      product_variants (
        id,
        sku,
        name,
        price,
        compare_at_price,
        stock_quantity,
        track_inventory,
        low_stock_threshold,
        is_active,
        sort_order,
        attributes
      ),
      product_images (
        id,
        url,
        alt_text,
        is_primary,
        sort_order,
        variant_id
      )
    `
    )
    .eq("slug", slug)

  if (activeOnly) {
    query = query.eq("is_active", true)
  }

  const { data: productData, error } = await query.single()

  if (error) {
    if (error.code === "PGRST116") {
      return { success: false, error: "PRODUCT_NOT_FOUND" }
    }
    return {
      success: false,
      error: "FETCH_PRODUCT_ERROR",
      details: { database: [error.message] },
    }
  }

  const product = productData as unknown as ProductWithRelations

  // فحص عروض الفلاش النشطة لهذا المنتج
  const { data: flashSaleItem } = await supabase
    .from("flash_sale_items")
    .select(
      `
      id,
      discount_percentage,
      discount_amount,
      flash_sales!inner (
        id,
        is_active,
        start_time,
        end_time
      )
    `
    )
    .eq("product_id", product.id)
    .eq("flash_sales.is_active", true)
    .lte("flash_sales.start_time", now)
    .gte("flash_sales.end_time", now)
    .maybeSingle()

  let flash_sale_deal: FlashSaleDeal | null = null

  if (flashSaleItem && flashSaleItem.flash_sales) {
    const parentSale = Array.isArray(flashSaleItem.flash_sales)
      ? flashSaleItem.flash_sales[0]
      : flashSaleItem.flash_sales

    const discountPercentage = Number(flashSaleItem.discount_percentage) || 0

    flash_sale_deal = {
      id: flashSaleItem.id,
      discount_percentage: discountPercentage,
      sale_price: flashSaleItem.discount_amount ? Number(flashSaleItem.discount_amount) : null,
      end_time: parentSale.end_time,
    }

    // تطبيق الخصم فورياً على أسعار الـ variants مع الاحتفاظ بالسعر القديم في compare_at_price
    if (discountPercentage > 0) {
      product.product_variants = product.product_variants.map((variant) => {
        const originalPrice = variant.price
        const discountedPrice = Math.round(originalPrice * (1 - discountPercentage / 100))

        return {
          ...variant,
          compare_at_price: variant.compare_at_price || originalPrice, // السعر القديم ليظهر مشطوباً
          price: discountedPrice, // السعر الفعلي بعد خصم الفلاش
        }
      })
    }
  }

  return {
    success: true,
    data: {
      ...product,
      flash_sale_deal,
    },
  }
}