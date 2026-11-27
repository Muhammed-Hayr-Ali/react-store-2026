/**
 * @file lib/actions/products/types.ts
 * @description Pure TypeScript type definitions and interfaces for the products domain.
 */

// ============================================================================
// 1 & 2. أنواع الإدخال الرئيسية (Create & Update)
// ============================================================================
export type { CreateProductInput, UpdateProductInput } from "./schemas"

// ============================================================================
// Relational Entity Types (للاستخدام في الواجهات والمكونات Client/Server)
// ============================================================================

import type { Json, Tables } from "@/lib/database/supabase/types"

type ProductVariantColumns = Pick<
  Tables<"product_variants">,
  | "id"
  | "sku"
  | "name"
  | "attributes"
  | "price"
  | "compare_at_price"
  | "stock_quantity"
  | "track_inventory"
  | "low_stock_threshold"
  | "expiration_date"
  | "is_active"
  | "sort_order"
>

export type ProductVariantItem = Omit<ProductVariantColumns, "attributes"> & {
  attributes: Record<string, string>
}

export type ProductImageItem = Pick<
  Tables<"product_images">,
  "id" | "url" | "alt_text" | "is_primary" | "sort_order" | "variant_id"
>

export type ProductWithRelations = Tables<"products"> & {
  category: Pick<
    Tables<"categories">,
    "id" | "name" | "name_ar" | "slug" | "parent_id"
  > | null
  brand: Pick<
    Tables<"brands">,
    "id" | "name" | "name_ar" | "slug" | "image_url"
  > | null
  product_variants: ProductVariantItem[]
  product_images: ProductImageItem[]
}

/** Lightweight product data returned to the dashboard products table. */
export type AdminProductSummary = Pick<
  Tables<"products">,
  "id" | "name" | "slug" | "is_active"
> & {
  category_name: string | null
  brand_name: string | null
  nearest_expiration_date: string | null
  total_stock: number
  min_price: number
  max_price: number
}

export function isStringAttributes(
  value: Json | null
): value is Record<string, string> {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.values(value).every((item) => typeof item === "string")
  )
}

export function isProductAttributes(
  value: Json | null
): value is Record<string, string | number | boolean> {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.values(value).every(
      (item) =>
        typeof item === "string" ||
        typeof item === "number" ||
        typeof item === "boolean"
    )
  )
}

/** Aggregate counts displayed above the products dashboard table. */
export interface AdminProductsSummary {
  active: number
  lowStock: number
  expiringSoon: number
}
