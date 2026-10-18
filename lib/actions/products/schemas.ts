/**
 * @file lib/actions/products/schemas.ts
 * @description Zod validation schemas for products.
 */

import { z } from "zod"

// ============================================================================
// اللبنات الأساسية (Building Blocks - لا يتم تصديرها كأنواع رئيسية)
// ============================================================================

const variantBaseSchema = z
  .object({
    sku: z.string().min(1, "SKU_REQUIRED"),
    name: z.string().optional().or(z.literal("")),
    attributes: z.record(z.string(), z.string()).optional(),
    price: z.number().min(0, "PRICE_MUST_BE_POSITIVE"),
    compare_at_price: z.number().min(0).nullable().optional(),
    stock_quantity: z.number().int().min(0, "STOCK_MUST_BE_POSITIVE"),
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
      message: "COMPARE_AT_PRICE_MUST_BE_GREATER",
      path: ["compare_at_price"],
    }
  )

const imageBaseSchema = z.object({
  url: z.string().min(1, "IMAGE_LINK_INVALID"),
  alt_text: z.string().optional().or(z.literal("")),
  is_primary: z.boolean(),
  variant_sku: z.string().optional().or(z.literal("")),
})

// ============================================================================
// 1. النوع الأول: إنشاء منتج (Create Product)
// ============================================================================

export const createProductSchema = z.object({
  category_id: z.string().uuid("INVALID_CATEGORY_ID"),
  brand_id: z.string().uuid("INVALID_BRAND_ID").nullable().optional(),
  name: z.string().min(1, "NAME_REQUIRED"),
  slug: z
    .string()
    .min(1, "SLUG_REQUIRED")
    .regex(/^[a-z0-9-]+$/, "SLUG_INVALID_FORMAT"),
  description: z.string().nullable().optional(),
  meta_title: z.string().max(70, "META_TITLE_TOO_LONG").nullable().optional(),
  meta_description: z.string().nullable().optional(),
  is_active: z.boolean(),
  is_featured: z.boolean(),
  variants: z.array(variantBaseSchema).min(1, "AT_LEAST_ONE_VARIANT_REQUIRED"),
  images: z.array(imageBaseSchema).min(1, "AT_LEAST_ONE_IMAGE_REQUIRED"),
})

export type CreateProductInput = z.infer<typeof createProductSchema>

// ============================================================================
// 2. النوع الثاني: تحديث منتج (Update Product)
// ============================================================================

// يرث كل خصائص الإنشاء بالإضافة إلى الـ ID الإلزامي
export const updateProductSchema = createProductSchema.extend({
  id: z.string().uuid("INVALID_ID"),
})

export type UpdateProductInput = z.infer<typeof updateProductSchema>

// ============================================================================
// Storefront & Admin Queries (مخططات جلب البيانات)
// ============================================================================

export const getProductsQuerySchema = z.object({
  limit: z.number().int().positive().max(100).default(20),
  activeOnly: z.boolean().default(true),
  categoryId: z.string().uuid().optional(),
  categorySlug: z.string().optional(),
  brandId: z.string().uuid().optional(),
  brandSlug: z.string().optional(),
  flashSaleId: z.string().uuid().optional(),
})

export type GetProductsQueryOptions = z.input<typeof getProductsQuerySchema>

export const getLatestProductsSchema = z.object({
  limit: z.number().int().positive().max(50).default(10),
  activeOnly: z.boolean().default(true),
})

export type GetLatestProductsOptions = z.infer<typeof getLatestProductsSchema>

export const getProductsByCategorySchema = z
  .object({
    categorySlug: z.string().min(1, "CATEGORY_SLUG_REQUIRED").optional(),
    categoryId: z.string().uuid("INVALID_CATEGORY_ID").optional(),
    limit: z.number().int().positive().max(100).default(20),
    activeOnly: z.boolean().default(true),
  })
  .refine((data) => Boolean(data.categorySlug || data.categoryId), {
    message: "CATEGORY_SLUG_OR_ID_REQUIRED",
    path: ["categorySlug"],
  })

export type GetProductsByCategoryOptions = z.infer<
  typeof getProductsByCategorySchema
>

export const getProductsByBrandSchema = z
  .object({
    brandSlug: z.string().min(1, "BRAND_SLUG_REQUIRED").optional(),
    brandId: z.string().uuid("INVALID_BRAND_ID").optional(),
    limit: z.number().int().positive().max(100).default(20),
    activeOnly: z.boolean().default(true),
  })
  .refine((data) => Boolean(data.brandSlug || data.brandId), {
    message: "BRAND_SLUG_OR_ID_REQUIRED",
    path: ["brandSlug"],
  })

export type GetProductsByBrandOptions = z.infer<typeof getProductsByBrandSchema>
