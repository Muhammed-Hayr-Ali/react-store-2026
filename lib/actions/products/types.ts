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
  GetProductsQueryOptions,
  GetLatestProductsOptions,
  GetProductsByCategoryOptions,
  GetProductsByBrandOptions,
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

export interface ProductFlashSaleDeal {
  id: string
  title: string
  title_ar?: string | null
  slug: string
  discount_type: string
  discount_value: number
  calculated_percentage: number
  end_time: string
  quantity_limit: number | null
  sold_count: number
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
  flash_sale_deal?: ProductFlashSaleDeal | null
}

/** Lightweight product data returned to the dashboard products table. */
export interface AdminProductSummary {
  id: string
  name: string
  slug: string
  is_active: boolean
  is_featured: boolean
  created_at: string
  category_name: string | null
  brand_name: string | null
  variants_count: number
  total_stock: number
  min_price: number
  max_price: number
}

/** Product fields formatted for featured product carousel slides. */
export interface FeaturedProductSlide {
  id: string
  name: string
  slug: string
  description: string | null
  min_price: number
  primary_image_url: string | null
  brand_name: string | null
}

export interface LatestProductItem {
  id: string
  name: string
  slug: string
  description: string | null
  created_at: string
  brand_name: string | null
  brand_slug?: string | null
  category_name: string | null
  category_slug: string | null
  primary_image_url: string | null
  min_price: number
}

export interface CategoryProductItem extends Omit<LatestProductItem, "brand_slug"> {
  is_featured: boolean
  brand_slug?: string | null
}

export interface BrandProductItem extends LatestProductItem {
  is_featured: boolean
  brand_slug: string | null
}

export interface RawBrand {
  name: string
  slug?: string | null
}

export interface RawCategory {
  name: string
  slug: string
  name_ar?: string | null
  parent_id?: string | null
}

export interface RawProductVariant {
  price: number
  compare_at_price?: number | null
  is_active: boolean
}

export interface RawProductImage {
  url: string
  alt_text?: string | null
  is_primary: boolean
  sort_order?: number | null
}

export interface RawLatestProductQueryResult {
  id: string
  name: string
  slug: string
  description: string | null
  created_at: string
  brand: RawBrand | null
  category: RawCategory | null
  product_variants: RawProductVariant[] | null
  product_images: RawProductImage[] | null
}

export interface RawCategoryProductQueryResult
  extends Omit<RawLatestProductQueryResult, "created_at"> {
  is_featured: boolean
  created_at: string
}

export type RawBrandProductQueryResult = RawCategoryProductQueryResult
