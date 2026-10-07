/**
 * @file lib/actions/flash-sales/queries/get-flash-sale-for-edit.ts
 * @description Query to fetch flash sale data pre-formatted for editing in administration forms.
 */

"use server"

import { z } from "zod"
import { createServerClient } from "@/lib/database/supabase/server"
import { FlashSaleDiscountType, FlashSaleFormInput } from "../types"

// ============================================================================
// Internal Types
// ============================================================================

interface RawProductData {
  id: string
  name: string
  product_variants?: Array<{
    price: number | null
    is_active: boolean | null
  }> | null
}

interface RawItemData {
  id: string
  product_id: string
  discount_type: FlashSaleDiscountType
  discount_value: number | null
  quantity_limit: number | null
  products: RawProductData | null
}

interface RawSaleData {
  id: string
  title: string
  title_ar: string | null
  slug: string
  description: string | null
  starts_at: string
  ends_at: string
  is_active: boolean
  flash_sale_items: RawItemData[]
}

// ============================================================================
// Main Query Function
// ============================================================================

export async function getFlashSaleForEdit(
  id: string
): Promise<{ saleId: string; initialData: FlashSaleFormInput } | null> {
  const idValidation = z.string().uuid("INVALID_SALE_ID").safeParse(id)
  if (!idValidation.success) {
    return null
  }

  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("flash_sales")
    .select(
      `
      id,
      title,
      title_ar,
      slug,
      description,
      starts_at,
      ends_at,
      is_active,
      flash_sale_items (
        id,
        product_id,
        discount_type,
        discount_value,
        quantity_limit,
        products (
          id,
          name,
          product_variants (
            price,
            is_active
          )
        )
      )
    `
    )
    .eq("id", idValidation.data)
    .maybeSingle()

  if (error || !data) {
    if (error) {
      console.error("Error in getFlashSaleForEdit:", error.message)
    }
    return null
  }

  const sale = data as unknown as RawSaleData

  const formatDateTimeLocal = (isoString: string) => {
    try {
      const d = new Date(isoString)
      return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16)
    } catch {
      return ""
    }
  }

  const items: FlashSaleFormInput["items"] = []

  for (const item of sale.flash_sale_items) {
    if (!item.products) continue

    let basePrice = 0
    if (
      Array.isArray(item.products.product_variants) &&
      item.products.product_variants.length > 0
    ) {
      const prices = item.products.product_variants
        .filter((v) => v.is_active !== false && typeof v.price === "number")
        .map((v) => v.price as number)
      if (prices.length > 0) {
        basePrice = Math.min(...prices)
      }
    }

    items.push({
      productId: item.product_id,
      productName: item.products.name,
      productPrice: basePrice,
      discountType: item.discount_type,
      discountValue: item.discount_value,
      quantityLimit: item.quantity_limit,
    })
  }

  return {
    saleId: sale.id,
    initialData: {
      title: sale.title,
      titleAr: sale.title_ar,
      slug: sale.slug,
      description: sale.description,
      startsAt: formatDateTimeLocal(sale.starts_at),
      endsAt: formatDateTimeLocal(sale.ends_at),
      isActive: sale.is_active,
      items,
    },
  }
}
