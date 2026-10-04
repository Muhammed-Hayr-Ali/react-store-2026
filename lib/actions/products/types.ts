/**
 * @file lib/actions/products/types.ts
 * @description Pure TypeScript type definitions and interfaces for the products domain.
 * Safe for direct import across both Client and Server Components.
 */

import { z } from "zod"
import {
  productSchema,
  variantSchema,
  imageSchema,
  createProductCompleteSchema,
  adminProductSummarySchema,
  getLatestProductsSchema,
  getProductsByCategorySchema,
  getProductsByBrandSchema,
  getFlashSaleProductsSchema,
} from "./schemas"

// ============================================================================
// Entity & Inferred Types
// ============================================================================

export type Product = z.infer<typeof productSchema>
export type VariantInput = z.infer<typeof variantSchema>
export type ImageInput = z.infer<typeof imageSchema>
export type CreateProductCompleteInput = z.infer<
  typeof createProductCompleteSchema
>
export type AdminProductSummary = z.infer<typeof adminProductSummarySchema>
export type GetLatestProductsOptions = z.infer<typeof getLatestProductsSchema>
export type GetProductsByCategoryOptions = z.infer<
  typeof getProductsByCategorySchema
>
export type GetProductsByBrandOptions = z.infer<typeof getProductsByBrandSchema>
export type GetFlashSaleProductsOptions = z.infer<
  typeof getFlashSaleProductsSchema
>

export interface CreatedVariant {
  id: string
  sku: string
}

// ============================================================================
// Flash Sale Types
// ============================================================================

export interface ProductFlashSaleDeal {
  id: string
  title: string
  title_ar?: string | null
  slug: string
  discount_type: "percentage" | "fixed" | "fixed_price" | string
  discount_value: number
  calculated_percentage: number
  end_time: string
  quantity_limit: number | null
  sold_count: number
}

// ============================================================================
// Relational Entity Types
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
  sort_order: number
  variant_id: string | null
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
    logo_url?: string | null
  } | null
  product_variants: ProductVariantItem[]
  product_images: ProductImageItem[]
  flash_sale_deal?: ProductFlashSaleDeal | null
}

// ============================================================================
// Storefront Feeds Interfaces
// ============================================================================

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

export interface CategoryProductItem {
  id: string
  name: string
  slug: string
  description: string | null
  is_featured: boolean
  created_at: string
  brand_name: string | null
  brand_slug?: string | null
  category_name: string | null
  category_slug: string | null
  primary_image_url: string | null
  min_price: number
}

export interface BrandProductItem {
  id: string
  name: string
  slug: string
  description: string | null
  is_featured: boolean
  created_at: string
  brand_name: string | null
  brand_slug: string | null
  category_name: string | null
  category_slug: string | null
  primary_image_url: string | null
  min_price: number
}

// ============================================================================
// Raw Database Query Types
// ============================================================================

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

export interface RawCategoryProductQueryResult {
  id: string
  name: string
  slug: string
  description: string | null
  is_featured: boolean
  created_at: string
  brand: RawBrand | null
  category: RawCategory | null
  product_variants: RawProductVariant[] | null
  product_images: RawProductImage[] | null
}

export interface RawBrandProductQueryResult {
  id: string
  name: string
  slug: string
  description: string | null
  is_featured: boolean
  created_at: string
  brand: RawBrand | null
  category: RawCategory | null
  product_variants: RawProductVariant[] | null
  product_images: RawProductImage[] | null
}
