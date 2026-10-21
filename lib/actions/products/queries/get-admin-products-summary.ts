/**
 * @file lib/actions/products/queries/get-admin-products-summary.ts
 * @description Retrieves aggregate product counts for the dashboard summary based on minimum variant stock and expiration dates.
 */

"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import { addDays, format, startOfToday } from "date-fns"
import type { ApiResult } from "../../types/utils"
import type { AdminProductsSummary } from "../types"

interface ProductSummaryRecord {
  is_active: boolean
  product_variants: Array<{
    stock_quantity: number | null
    expiration_date: string | null
  }> | null
}

export async function getAdminProductsSummary(): Promise<
  ApiResult<AdminProductsSummary>
> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      is_active,
      product_variants (stock_quantity, expiration_date)
    `
    )

  if (error) {
    return {
      success: false,
      error: "FETCH_ADMIN_PRODUCTS_ERROR",
      details: { database: [error.message] },
    }
  }

  const products = (data ?? []) as unknown as ProductSummaryRecord[]
  const today = startOfToday()
  const expirationLimit = addDays(today, 30)
  const todayValue = format(today, "yyyy-MM-dd")
  const expirationLimitValue = format(expirationLimit, "yyyy-MM-dd")

  return {
    success: true,
    data: {
      active: products.filter((product) => product.is_active).length,
      lowStock: products.filter((product) => {
        const variants = product.product_variants ?? []
        if (variants.length === 0) return true // إذا لم تكن هناك متغيرات يعتبر مخزون منخفض

        // استخراج جميع الكميات وحساب الحد الأدنى (أقل كمية متوفرة بين المتغيرات)
        const stockQuantities = variants
          .map((v) => Number(v.stock_quantity))
          .filter((s) => !isNaN(s))

        const minStock = stockQuantities.length > 0 ? Math.min(...stockQuantities) : 0
        
        return minStock <= 10
      }).length,
      expiringSoon: products.filter((product) =>
        (product.product_variants ?? []).some(
          (variant) =>
            Boolean(variant.expiration_date) &&
            variant.expiration_date! >= todayValue &&
            variant.expiration_date! <= expirationLimitValue
        )
      ).length,
    },
  }
}