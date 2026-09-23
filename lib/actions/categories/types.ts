import { z } from "zod"

export const categorySchema = z.object({
  id: z.uuid("INVALID_ID"),
  parent_id: z.uuid("INVALID_PARENT_ID").nullable(),
  name: z.string().min(1, "NAME_REQUIRED").max(100, "NAME_TOO_LONG"),
  name_ar: z.string().nullable(),
  slug: z
    .string()
    .min(1, "SLUG_REQUIRED")
    .regex(/^[a-z0-9-]+$/, "slug_invalid_format"),
  description: z.string().nullable(),
  image_url: z.url("INVALID_URL").nullable().or(z.literal("")),
  image_alt: z.string().nullable(),
  is_active: z.boolean(),
  sort_order: z
    .number()
    .int("SORT_ORDER_MUST_BE_INTEGER")
    .min(0, "SORT_ORDER_MUST_BE_POSITIVE"),
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
