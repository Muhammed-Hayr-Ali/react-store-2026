/**
 * @file lib/actions/categories/schemas.ts
 * @description Zod validation schemas for Category domain mutations and queries.
 */

import { z } from "zod"

// ============================================================================
// Base Category Schema (Database Row Contract)
// ============================================================================

export const categorySchema = z.object({
  id: z.string().uuid("INVALID_CATEGORY_ID"),
  parent_id: z.string().uuid("INVALID_PARENT_ID").nullable(),
  name: z
    .string()
    .trim()
    .min(1, "CATEGORY_NAME_REQUIRED")
    .max(100, "CATEGORY_NAME_TOO_LONG"),
  name_ar: z
    .string()
    .trim()
    .max(100, "CATEGORY_NAME_AR_TOO_LONG")
    .nullable()
    .or(z.literal("")),
  slug: z
    .string()
    .trim()
    .min(1, "CATEGORY_SLUG_REQUIRED")
    .max(120, "CATEGORY_SLUG_TOO_LONG")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "INVALID_SLUG_FORMAT"),
  description: z
    .string()
    .trim()
    .max(500, "CATEGORY_DESCRIPTION_TOO_LONG")
    .nullable()
    .or(z.literal("")),
  image_url: z
    .string()
    .trim()
    .url("INVALID_IMAGE_URL")
    .nullable()
    .or(z.literal("")),
  image_alt: z
    .string()
    .trim()
    .max(200, "IMAGE_ALT_TOO_LONG")
    .nullable()
    .or(z.literal("")),
  is_active: z.boolean().default(true),
  sort_order: z
    .number()
    .int("SORT_ORDER_MUST_BE_INTEGER")
    .min(0, "SORT_ORDER_MUST_BE_POSITIVE")
    .default(0),
  created_at: z.string(),
  updated_at: z.string(),
})

// ============================================================================
// Mutation Schemas
// ============================================================================

export const createCategorySchema = categorySchema
  .omit({
    id: true,
    created_at: true,
    updated_at: true,
  })
  .extend({
    parent_id: z.string().uuid("INVALID_PARENT_ID").nullable().optional(),
    name_ar: z
      .string()
      .trim()
      .max(100, "CATEGORY_NAME_AR_TOO_LONG")
      .nullable()
      .or(z.literal(""))
      .optional(),
    description: z
      .string()
      .trim()
      .max(500, "CATEGORY_DESCRIPTION_TOO_LONG")
      .nullable()
      .or(z.literal(""))
      .optional(),
    image_url: z
      .string()
      .trim()
      .url("INVALID_IMAGE_URL")
      .nullable()
      .or(z.literal(""))
      .optional(),
    image_alt: z
      .string()
      .trim()
      .max(200, "IMAGE_ALT_TOO_LONG")
      .nullable()
      .or(z.literal(""))
      .optional(),
    is_active: z.boolean().optional().default(true),
    sort_order: z
      .number()
      .int("SORT_ORDER_MUST_BE_INTEGER")
      .min(0, "SORT_ORDER_MUST_BE_POSITIVE")
      .optional()
      .default(0),
  })

export const updateCategorySchema = createCategorySchema.partial()

export const toggleCategoryStatusSchema = z.object({
  id: z.string().uuid("INVALID_CATEGORY_ID"),
  is_active: z.boolean(),
})

export const reorderCategoriesSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().uuid("INVALID_CATEGORY_ID"),
        sort_order: z
          .number()
          .int("SORT_ORDER_MUST_BE_INTEGER")
          .min(0, "SORT_ORDER_MUST_BE_POSITIVE"),
      })
    )
    .min(1, "NO_ITEMS_TO_REORDER"),
})

export const deleteBatchCategoriesSchema = z.object({
  ids: z
    .array(z.string().uuid("INVALID_CATEGORY_ID"))
    .min(1, "NO_IDS_PROVIDED"),
})

// ============================================================================
// Query Filter Schema (Sanitized with .preprocess)
// ============================================================================

export const getCategoriesFilterSchema = z.object({
  search: z.preprocess(
    (val) => (typeof val === "string" && val.trim() === "" ? undefined : val),
    z.string().trim().optional()
  ),
  parent_id: z.preprocess(
    (val) => (val === "all" || val === "" || val === null ? undefined : val),
    z.string().uuid("INVALID_PARENT_ID").optional()
  ),
  is_active: z.preprocess((val) => {
    if (val === "true" || val === true) return true
    if (val === "false" || val === false) return false
    return undefined
  }, z.boolean().optional()),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})
