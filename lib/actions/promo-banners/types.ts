import type { Tables } from "@/lib/database/supabase/database.types"
import type { z } from "zod"

import type {
  createPromoBannerSchema,
  updatePromoBannerSchema,
} from "./schemas"

export type PromoBanner = Tables<"promo_banners">

export type AdminPromoBannerSummary = Pick<
  PromoBanner,
  | "id"
  | "title"
  | "title_ar"
  | "subtitle"
  | "subtitle_ar"
  | "badge_text"
  | "badge_text_ar"
  | "cta_label"
  | "cta_label_ar"
  | "cta_href"
  | "image_url"
  | "image_alt"
  | "priority"
  | "is_active"
  | "starts_at"
  | "ends_at"
  | "created_at"
  | "updated_at"
>

export type CreatePromoBannerValues = z.output<typeof createPromoBannerSchema>
export type UpdatePromoBannerValues = z.output<typeof updatePromoBannerSchema>
