/**
 * @file lib/actions/products/queries/get-complete-by-slug.ts
 * @description Retrieves a full product with all related variants, images, and active flash sale data by slug.
 */

"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import type { ProductWithRelations, ProductFlashSaleDeal } from "../types"

interface GetProductOptions {
  activeOnly?: boolean
}

export async function getProductCompleteBySlug(
  slug: string,
  options: GetProductOptions = {}
): Promise<ApiResult<ProductWithRelations>> {
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

  const { data: flashSaleItem, error: flashSaleError } = await supabase
    .from("flash_sale_items")
    .select(
      `
      id,
      discount_type,
      discount_value,
      quantity_limit,
      sold_count,
      flash_sales!inner (
        id,
        title,
        title_ar,
        slug,
        is_active,
        starts_at,
        ends_at
      )
    `
    )
    .eq("product_id", product.id)
    .eq("flash_sales.is_active", true)
    .lte("flash_sales.starts_at", now)
    .gte("flash_sales.ends_at", now)
    .maybeSingle()

  if (flashSaleError) {
    console.error("🔴 [Flash Sale Query Error]:", flashSaleError.message)
  }

  let flash_sale_deal: ProductFlashSaleDeal | null = null

  if (flashSaleItem && flashSaleItem.flash_sales) {
    const parentSale = Array.isArray(flashSaleItem.flash_sales)
      ? flashSaleItem.flash_sales[0]
      : flashSaleItem.flash_sales

    const rawDiscountType = String(
      flashSaleItem.discount_type || ""
    ).toLowerCase()
    const discountVal = Number(flashSaleItem.discount_value) || 0

    const isAvailable =
      flashSaleItem.quantity_limit === null ||
      flashSaleItem.sold_count < flashSaleItem.quantity_limit

    if (isAvailable && discountVal > 0) {
      let samplePercentage = 0

      product.product_variants = product.product_variants.map((variant) => {
        const originalPrice = Number(variant.price)
        let discountedPrice = originalPrice

        if (
          rawDiscountType === "fixed_price" ||
          rawDiscountType === "price" ||
          rawDiscountType === "fixed_amount_price"
        ) {
          discountedPrice = discountVal
          if (originalPrice > discountedPrice) {
            samplePercentage = Math.round(
              ((originalPrice - discountedPrice) / originalPrice) * 100
            )
          }
        } else if (rawDiscountType === "percentage") {
          discountedPrice = Math.round(originalPrice * (1 - discountVal / 100))
          samplePercentage = Math.round(discountVal)
        } else if (
          rawDiscountType === "fixed" ||
          rawDiscountType === "fixed_discount" ||
          rawDiscountType === "fixed_amount"
        ) {
          discountedPrice = Math.max(0, originalPrice - discountVal)
          if (originalPrice > 0) {
            samplePercentage = Math.round(
              ((originalPrice - discountedPrice) / originalPrice) * 100
            )
          }
        }

        return {
          ...variant,
          compare_at_price:
            variant.compare_at_price && variant.compare_at_price > originalPrice
              ? variant.compare_at_price
              : originalPrice,
          price: discountedPrice,
        }
      })

      flash_sale_deal = {
        id: flashSaleItem.id,
        title: parentSale.title,
        title_ar: parentSale.title_ar,
        slug: parentSale.slug,
        discount_type: rawDiscountType,
        discount_value: discountVal,
        calculated_percentage: samplePercentage,
        end_time: parentSale.ends_at,
        quantity_limit: flashSaleItem.quantity_limit,
        sold_count: flashSaleItem.sold_count,
      }
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
