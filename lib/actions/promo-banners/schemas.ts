import { z } from "zod"

export function isValidPromoBannerUrl(value: string): boolean {
  if (!value) return true
  if (value.startsWith("/") && !value.startsWith("//")) {
    return !/\s/.test(value)
  }

  try {
    const url = new URL(value)
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      Boolean(url.hostname)
    )
  } catch {
    return false
  }
}

const optionalText = (maxLength: number, message: string) =>
  z
    .string()
    .trim()
    .max(maxLength, { message })
    .nullable()
    .optional()
    .transform((value) => value || null)

const optionalUrl = (maxLength: number, message: string) =>
  z
    .string()
    .trim()
    .max(maxLength, { message })
    .refine(isValidPromoBannerUrl, { message })
    .nullable()
    .optional()
    .transform((value) => value || null)

const optionalDateTime = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || Number.isFinite(Date.parse(value)),
    { message: "INVALID_PROMO_BANNER_DATE_ERROR" }
  )
  .nullable()
  .optional()
  .transform((value) => (value ? new Date(value).toISOString() : null))

const promoBannerFields = {
  title: z
    .string()
    .trim()
    .min(1, { message: "PROMO_BANNER_TITLE_REQUIRED_ERROR" })
    .max(255, { message: "PROMO_BANNER_TEXT_TOO_LONG_ERROR" }),
  title_ar: optionalText(255, "PROMO_BANNER_TEXT_TOO_LONG_ERROR"),
  subtitle: optionalText(500, "PROMO_BANNER_TEXT_TOO_LONG_ERROR"),
  subtitle_ar: optionalText(500, "PROMO_BANNER_TEXT_TOO_LONG_ERROR"),
  badge_text: optionalText(100, "PROMO_BANNER_TEXT_TOO_LONG_ERROR"),
  badge_text_ar: optionalText(100, "PROMO_BANNER_TEXT_TOO_LONG_ERROR"),
  cta_label: optionalText(100, "PROMO_BANNER_TEXT_TOO_LONG_ERROR"),
  cta_label_ar: optionalText(100, "PROMO_BANNER_TEXT_TOO_LONG_ERROR"),
  cta_href: optionalUrl(2048, "INVALID_PROMO_BANNER_LINK_ERROR"),
  image_url: optionalUrl(2048, "INVALID_PROMO_BANNER_IMAGE_URL_ERROR"),
  image_alt: optionalText(255, "PROMO_BANNER_IMAGE_ALT_TOO_LONG_ERROR"),
  priority: z.coerce
    .number()
    .int({ message: "INVALID_PROMO_BANNER_PRIORITY_ERROR" })
    .default(0),
  is_active: z.boolean().default(true),
  starts_at: optionalDateTime,
  ends_at: optionalDateTime,
}

const promoBannerFormSchema = z.object(promoBannerFields).refine(
  (value) =>
    !value.starts_at ||
    !value.ends_at ||
    new Date(value.ends_at).getTime() > new Date(value.starts_at).getTime(),
  {
    message: "PROMO_BANNER_ENDS_BEFORE_STARTS_ERROR",
    path: ["ends_at"],
  }
)

export const createPromoBannerSchema = promoBannerFormSchema

export const updatePromoBannerSchema = promoBannerFormSchema.extend({
  id: z.string().uuid({ message: "INVALID_UUID_ERROR" }),
})

export const promoBannerIdSchema = z.object({
  id: z.string().uuid({ message: "INVALID_UUID_ERROR" }),
})

export const togglePromoBannerStatusSchema = z.object({
  id: z.string().uuid({ message: "INVALID_UUID_ERROR" }),
  is_active: z.boolean(),
})

export type CreatePromoBannerInput = z.input<typeof createPromoBannerSchema>
export type UpdatePromoBannerInput = z.input<typeof updatePromoBannerSchema>
export type PromoBannerIdInput = z.input<typeof promoBannerIdSchema>
export type TogglePromoBannerStatusInput = z.input<
  typeof togglePromoBannerStatusSchema
>
