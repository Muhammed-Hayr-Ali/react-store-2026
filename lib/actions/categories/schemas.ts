/**
 * @file lib/actions/categories/schemas.ts
 * @description Zod schemas for Category entity validation with translation keys.
 */

import { z } from "zod"

export const categorySchema = z.object({
  id: z.string().uuid({ message: "INVALID_UUID_ERROR" }),
  parent_id: z
    .string()
    .uuid({ message: "INVALID_PARENT_ID_ERROR" })
    .nullable(),
  name: z
    .string()
    .trim()
    .min(1, { message: "CATEGORY_NAME_REQUIRED_ERROR" })
    .max(255, { message: "CATEGORY_NAME_TOO_LONG_ERROR" }),
  name_ar: z
    .string()
    .trim()
    .max(255, { message: "CATEGORY_NAME_TOO_LONG_ERROR" })
    .nullable(),
  slug: z
    .string()
    .trim()
    .min(1, { message: "CATEGORY_SLUG_REQUIRED_ERROR" })
    .max(255, { message: "CATEGORY_SLUG_TOO_LONG_ERROR" }),
  description: z.string().nullable(),
  description_ar: z.string().nullable(),
  image_url: z
    .string()
    .url({ message: "INVALID_IMAGE_URL_ERROR" })
    .max(508, { message: "INVALID_IMAGE_URL_ERROR" })
    .nullable()
    .or(z.literal("")),
  image_alt: z
    .string()
    .max(255, { message: "CATEGORY_IMAGE_ALT_TOO_LONG_ERROR" })
    .nullable(),
  sort_order: z.number().int({ message: "INVALID_SORT_ORDER_ERROR" }).default(0),
  is_active: z.boolean().default(true),
  created_at: z.string(),
  updated_at: z.string(),
})

/** Category fields accepted when creating or replacing a category. */
export const categoryFormSchema = categorySchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
})

export const updateCategorySchema = categoryFormSchema.extend({
  id: z.string().uuid({ message: "INVALID_UUID_ERROR" }),
})

export const categoryIdSchema = z.object({
  id: z.string().uuid({ message: "INVALID_UUID_ERROR" }),
})

export const categorySlugSchema = z.object({
  slug: z.string().trim().min(1, { message: "CATEGORY_SLUG_REQUIRED_ERROR" }),
})

export const getCategoriesSchema = z.object({
  includeInactive: z.boolean().default(false),
  parentId: z
    .string()
    .uuid({ message: "INVALID_PARENT_ID_ERROR" })
    .nullable()
    .optional(),
})

export type CategoryFormValues = z.output<typeof categoryFormSchema>
export type CategoryInput = z.input<typeof categoryFormSchema>
export type UpdateCategoryInput = z.input<typeof updateCategorySchema>
export type CategoryIdInput = z.infer<typeof categoryIdSchema>
export type CategorySlugInput = z.infer<typeof categorySlugSchema>
export type GetCategoriesInput = z.input<typeof getCategoriesSchema>