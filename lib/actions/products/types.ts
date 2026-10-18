/**
 * @file lib/actions/products/types.ts
 * @description Pure TypeScript type definitions and interfaces for the products domain.
 */

// ============================================================================
// 1 & 2. أنواع الإدخال الرئيسية (Create & Update)
// ============================================================================
export type {
  CreateProductInput,
  UpdateProductInput,
} from "./schemas"

// ============================================================================
// Relational Entity Types (للاستخدام في الواجهات والمكونات Client/Server)
// ============================================================================

export interface ProductVariantItem {
  id: string
  sku: string
  name: string | null
  attributes: Record<string, string>
  price: number
  compare_at_price: number | null
  stock_quantity: number
  track_inventory: boolean
  low_stock_threshold: number
  expiration_date: string | null
  is_active: boolean
  sort_order: number
}

export interface ProductImageItem {
  id: string
  url: string
  alt_text: string | null
  is_primary: boolean
  variant_sku: string | null
}

export interface ProductWithRelations {
  id: string
  brand_id: string | null
  category_id: string
  name: string
  slug: string
  description: string | null
  meta_title: string | null
  meta_description: string | null
  is_active: boolean
  is_featured: boolean
  created_at: string
  updated_at: string
  category: {
    id: string
    name: string
    name_ar: string | null
    slug: string
    parent_id?: string | null
  } | null
  brand: {
    id: string
    name: string
    name_ar?: string | null
    slug: string
    image_url?: string | null
  } | null
  product_variants: ProductVariantItem[]
  product_images: ProductImageItem[]
}

/** Lightweight product data returned to the dashboard products table. */
export interface AdminProductSummary {
  id: string
  name: string
  slug: string
  is_active: boolean
  category_name: string | null
  brand_name: string | null
  nearest_expiration_date: string | null
  total_stock: number
  min_price: number
  max_price: number
}
