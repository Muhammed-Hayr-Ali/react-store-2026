"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { AdminProductSummary, ProductWithRelations } from "../types"

// شكل السجل القادم من استعلام Supabase مشتق مباشرة من العلاقات في ProductWithRelations
type AdminProductQueryRecord = Pick<
  ProductWithRelations,
  "id" | "name" | "slug" | "is_active" | "is_featured" | "created_at"
> & {
  category: Pick<
    NonNullable<ProductWithRelations["category"]>,
    "name" | "name_ar"
  > | null
  brand: Pick<
    NonNullable<ProductWithRelations["brand"]>,
    "name" | "name_ar"
  > | null
  product_variants: Array<
    Pick<
      ProductWithRelations["product_variants"][number],
      "id" | "price" | "stock_quantity" | "is_active"
    >
  > | null
}

/**
 * جلب قائمة مقتضبة ومباشرة لجميع المنتجات للوحة التحكم
 */
export async function getAdminProductsList(): Promise<
  ApiResult<AdminProductSummary[]>
> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id,
      name,
      slug,
      is_active,
      is_featured,
      created_at,
      category:categories!products_category_id_fkey (
        name,
        name_ar
      ),
      brand:brands!products_brand_id_fkey (
        name,
        name_ar
      ),
      product_variants (
        id,
        price,
        stock_quantity,
        is_active
      )
    `
    )
    .order("created_at", { ascending: false })

  if (error) {
    return {
      success: false,
      error: "FETCH_ADMIN_PRODUCTS_ERROR",
      details: { database: [error.message] },
    }
  }

  const rawProducts = (data ?? []) as unknown as AdminProductQueryRecord[]

  const products: AdminProductSummary[] = rawProducts.map((prod) => {
    const variants = prod.product_variants ?? []

    // حساب إجمالي المخزون من المتغيرات
    const total_stock = variants.reduce(
      (sum, v) => sum + (Number(v.stock_quantity) || 0),
      0
    )

    // استخراج أسعار المتغيرات لحساب النطاق
    const prices = variants
      .map((v) => Number(v.price))
      .filter((p) => !isNaN(p) && p > 0)

    return {
      id: prod.id,
      name: prod.name,
      slug: prod.slug,
      is_active: prod.is_active,
      is_featured: prod.is_featured,
      created_at: prod.created_at,
      category_name: prod.category?.name_ar || prod.category?.name || null,
      brand_name: prod.brand?.name_ar || prod.brand?.name || null,
      variants_count: variants.length,
      total_stock,
      min_price: prices.length > 0 ? Math.min(...prices) : 0,
      max_price: prices.length > 0 ? Math.max(...prices) : 0,
    }
  })

  return {
    success: true,
    data: products,
  }
}
