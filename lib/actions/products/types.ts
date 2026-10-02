import { z } from "zod"

// ============================================================================
// 1. مخططات Zod الأساسية (Core Schemas & Entity Types)
// ============================================================================

// مخطط جدول المنتجات الرئيسي (مطابق لقاعدة البيانات)
export const productSchema = z.object({
  id: z.string().uuid("invalid_id"),
  brand_id: z.string().uuid("invalid_brand_id").nullable().optional(),
  category_id: z.string().uuid("invalid_category_id"),
  name: z.string().min(1, "name_required"),
  slug: z
    .string()
    .min(1, "slug_required")
    .regex(/^[a-z0-9-]+$/, "slug_invalid_format"),
  description: z.string().nullable().optional(),
  meta_title: z.string().max(70, "meta_title_too_long").nullable().optional(),
  meta_description: z.string().nullable().optional(),
  is_active: z.boolean(),
  is_featured: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
})

export type Product = z.infer<typeof productSchema>

// مخطط متغير المنتج (Product Variant)
export const variantSchema = z
  .object({
    sku: z.string().min(1, "sku_required"),
    name: z.string().optional().or(z.literal("")),
    attributes: z.record(z.string(), z.string()).optional(),
    price: z.number().min(0, "price_must_be_positive"),
    compare_at_price: z.number().min(0).nullable().optional(),
    stock_quantity: z.number().int().min(0, "stock_must_be_positive"),
    track_inventory: z.boolean(),
    low_stock_threshold: z.number().int().min(0),
    is_active: z.boolean(),
    sort_order: z.number().int().min(0),
  })
  .refine(
    (data) => {
      if (
        data.compare_at_price !== null &&
        data.compare_at_price !== undefined &&
        !isNaN(data.compare_at_price)
      ) {
        return data.compare_at_price > data.price
      }
      return true
    },
    {
      message: "Compare-at price must be greater than original price.",
      path: ["compare_at_price"],
    }
  )

export type VariantInput = z.infer<typeof variantSchema>

// مخطط صورة المنتج (Product Image)
export const imageSchema = z.object({
  url: z.string().url("image_link_invalid"),
  alt_text: z.string().optional().or(z.literal("")),
  is_primary: z.boolean(),
  variant_sku: z.string().optional().or(z.literal("")),
})

export type ImageInput = z.infer<typeof imageSchema>

// ============================================================================
// 2. مخططات الإدخال والتعديل (Mutations Schemas & Inputs)
// ============================================================================

export const createProductCompleteSchema = productSchema
  .omit({
    id: true,
    created_at: true,
    updated_at: true,
  })
  .extend({
    variants: z.array(variantSchema).min(1, "at_least_one_variant_required"),
    images: z.array(imageSchema).min(1, "at_least_one_image_required"),
  })

export type CreateProductCompleteInput = z.infer<
  typeof createProductCompleteSchema
>

export interface CreatedVariant {
  id: string
  sku: string
}

// ============================================================================
// 3. أنواع تفاصيل المنتج والعلاقات الكاملة (Product With Relations)
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
    slug: string // ✅ حقل slug أصبح ثابتاً ومطلوباً
    logo_url?: string | null
  } | null

  product_variants: ProductVariantItem[]
  product_images: ProductImageItem[]
}

// ============================================================================
// 4. مخططات وأنواع لوحة التحكم (Admin Dashboard)
// ============================================================================

export const adminProductSummarySchema = z.object({
  id: z.string().uuid("invalid_id"),
  name: z.string(),
  slug: z.string(),
  is_active: z.boolean(),
  is_featured: z.boolean(),
  created_at: z.string(),
  category_name: z.string().nullable(),
  brand_name: z.string().nullable(),
  variants_count: z.number().int().min(0),
  total_stock: z.number().int().min(0),
  min_price: z.number().min(0),
  max_price: z.number().min(0),
})

export type AdminProductSummary = z.infer<typeof adminProductSummarySchema>

// ============================================================================
// 5. استعلامات ومكونات واجهة المتجر (Storefront Feeds & Queries)
// ============================================================================

// أ. شريحة العرض البارزة (Featured Slide)
export interface FeaturedProductSlide {
  id: string
  name: string
  slug: string
  description: string | null
  min_price: number
  primary_image_url: string | null
  brand_name: string | null
}

// ب. أحدث المنتجات (Latest Products)
export const getLatestProductsSchema = z.object({
  limit: z.number().int().positive().max(50).default(10),
  activeOnly: z.boolean().default(true),
})

export type GetLatestProductsOptions = z.infer<typeof getLatestProductsSchema>

export interface LatestProductItem {
  id: string
  name: string
  slug: string
  description: string | null
  created_at: string
  brand_name: string | null
  brand_slug?: string | null // ✅ إضافة سلوج الماركة لأحدث المنتجات
  category_name: string | null
  category_slug: string | null
  primary_image_url: string | null
  min_price: number
}

// ج. استعلام المنتجات حسب التصنيف (Products By Category)
export const getProductsByCategorySchema = z
  .object({
    categorySlug: z.string().min(1, "category_slug_required").optional(),
    categoryId: z.string().uuid("invalid_category_id").optional(),
    limit: z.number().int().positive().max(100).default(20),
    activeOnly: z.boolean().default(true),
  })
  .refine((data) => Boolean(data.categorySlug || data.categoryId), {
    message: "Either categorySlug or categoryId must be provided",
    path: ["categorySlug"],
  })

export type GetProductsByCategoryOptions = z.infer<
  typeof getProductsByCategorySchema
>

export interface CategoryProductItem {
  id: string
  name: string
  slug: string
  description: string | null
  is_featured: boolean
  created_at: string
  brand_name: string | null
  brand_slug?: string | null // ✅ إضافة سلوج الماركة لمنتجات التصنيف
  category_name: string | null
  category_slug: string | null
  primary_image_url: string | null
  min_price: number
}

// د. استعلام المنتجات حسب الماركة (Products By Brand)
export const getProductsByBrandSchema = z
  .object({
    brandSlug: z.string().min(1, "brand_slug_required").optional(),
    brandId: z.string().uuid("invalid_brand_id").optional(),
    limit: z.number().int().positive().max(100).default(20),
    activeOnly: z.boolean().default(true),
  })
  .refine((data) => Boolean(data.brandSlug || data.brandId), {
    message: "Either brandSlug or brandId must be provided",
    path: ["brandSlug"],
  })

export type GetProductsByBrandOptions = z.infer<typeof getProductsByBrandSchema>

export interface BrandProductItem {
  id: string
  name: string
  slug: string
  description: string | null
  is_featured: boolean
  created_at: string
  brand_name: string | null
  brand_slug: string | null // ✅ مطلوب دائماً لمنتجات الماركة
  category_name: string | null
  category_slug: string | null
  primary_image_url: string | null
  min_price: number
}

// ============================================================================
// 6. أنواع استعلامات Supabase الخام (Raw DB Strongly Typed Results)
// ============================================================================

export interface RawBrand {
  name: string
  slug?: string | null // ✅ إضافة السلوج للاستعلامات
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
