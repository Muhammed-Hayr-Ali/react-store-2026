







import * as z from "zod"

export const brandSchema = z.object({
  id: z.uuid("INVALID_ID"),
  name: z.string().min(1, "NAME_REQUIRED").max(100, "NAME_TOO_LONG"),
  name_ar: z.string().nullable(),
  slug: z
    .string()
    .min(1, "SLUG_REQUIRED")
    .regex(/^[a-z0-9-]+$/, "slug_invalid_format"),
  logo_url: z.url("INVALID_URL").nullable().or(z.literal("")),
  logo_alt: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
})

export type Brand = z.infer<typeof brandSchema>

export const createBrandSchema = brandSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
})

export type CreateBrand = z.infer<typeof createBrandSchema>

export const updateBrandSchema = brandSchema
  .omit({
    id: true,
    created_at: true,
    updated_at: true,
  })
  .partial()

export type UpdateBrand = z.infer<typeof updateBrandSchema>