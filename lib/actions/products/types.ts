import { z } from "zod"

// ============================================================================
// 1. مخططات Zod (Schemas)
// ============================================================================

// مخطط المنتج الأساسي
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

// مخطط المتغير (Variant) مع شرط المقارنة اللحظي
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
      // إذا كان السعر قبل الخصم موجوداً وله قيمة رقمية
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
      path: ["compare_at_price"], // ربط الخطأ مباشرة بحقل compare_at_price
    }
  )

export type VariantInput = z.infer<typeof variantSchema>

// مخطط الصورة (Image)
export const imageSchema = z.object({
  url: z.string().url("image_link_invalid"),
  alt_text: z.string().optional().or(z.literal("")),
  is_primary: z.boolean(),
  variant_sku: z.string().optional().or(z.literal("")),
})

export type ImageInput = z.infer<typeof imageSchema>

// المخطط الشامل لإنشاء المنتج (منتج + متغيرات + صور)
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

export type CreatedVariant = {
  id: string
  sku: string
}

// مخطط ملخص المنتج المقتضب المخصص لجدول لوحة التحكم
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
// 2. أنواع البيانات (Types)
// ============================================================================

export type ProductWithRelations = {
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
  } | null

  brand: {
    id: string
    name: string
    name_ar: string | null
    slug: string
    logo_url: string | null
  } | null

  product_variants: {
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
  }[]

  product_images: {
    id: string
    url: string
    alt_text: string | null
    is_primary: boolean
    sort_order: number
    variant_id: string | null
  }[]
}

export interface FeaturedProductSlide {
  id: string
  name: string
  slug: string
  description: string | null
  min_price: number
  primary_image_url: string | null
  brand_name: string | null
}