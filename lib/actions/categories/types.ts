import { z } from "zod"

export const categorySchema = z.object({
  id: z.uuid("invalid_id"),
  parent_id: z.uuid("invalid_parent_id").nullable(),
  name: z.string().min(1, "name_required"),
  name_ar: z.string().nullable(),
  slug: z
    .string()
    .min(1, "slug_required")
    .regex(/^[a-z0-9-]+$/, "slug_invalid_format"),
  description: z.string().nullable(),
  image_url: z.url("image_link_invalid").nullable().or(z.literal("")),
  image_alt: z.string().nullable(),
  is_active: z.boolean(),
  sort_order: z
    .number()
    .int("sort_order_must_be_integer")
    .min(0, "sort_order_must_be_positive"),
  created_at: z.string(),
  updated_at: z.string(),
})

export type Category = z.infer<typeof categorySchema>

export const createCategorySchema = categorySchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
})
export type CreateCategoryInput = z.infer<typeof createCategorySchema>

export const updateCategorySchema = categorySchema
  .omit({
    id: true,
    created_at: true,
    updated_at: true,
  })
  .partial()
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
