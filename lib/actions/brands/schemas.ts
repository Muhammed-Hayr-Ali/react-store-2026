/**
 * @file lib/actions/brands/schemas.ts
 * @description Zod validation schemas for Brands form inputs and mutations.
 */

import { z } from "zod"

// 1. Base Schema (Create)
export const brandSchema = z.object({
  name: z.string().min(1, "Name is required"),
  name_ar: z.string().nullable().optional(),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  description: z.string().nullable().optional(),
  description_ar: z.string().nullable().optional(),
  image_url: z.string().url("Invalid image URL").nullable().optional(),
  image_alt: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().default(0),
  meta_title: z.string().nullable().optional(),
  meta_description: z.string().nullable().optional(),
})

export type BrandFormValues = z.infer<typeof brandSchema>

// 2. Update Schema
export const updateBrandSchema = brandSchema.extend({
  id: z.string().uuid("Invalid brand ID"),
})

export type UpdateBrandInput = z.infer<typeof updateBrandSchema>

// 3. ID Schema (for Delete & GetById)
export const brandIdSchema = z.object({
  id: z.string().uuid("Invalid brand ID"),
})

export type BrandIdInput = z.infer<typeof brandIdSchema>

// 4. Slug Schema (for GetBySlug)
export const brandSlugSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
})

export type BrandSlugInput = z.infer<typeof brandSlugSchema>

// 5. Get List Schema (for GetBrands)
export const getBrandsSchema = z.object({
  includeInactive: z.boolean().optional().default(false),
})

// استخدام z.input بدلاً من z.infer لحل مشكلة النوع المفقود في TypeScript
export type GetBrandsInput = z.input<typeof getBrandsSchema>