/**
 * @file lib/actions/categories/types.ts
 * @description TypeScript types and interfaces for Categories management.
 * Fully synchronized with database schema and Zod validation schemas.
 */

import { z } from "zod"
 import { categoryFormSchema } from "./schemas"
import { Tables } from "@/lib/database/supabase/database.types"

export type Category = Tables<"categories">

export type CategoryInput = z.input<typeof categoryFormSchema>

export type CategorySummary = Pick<
  Category,
  | "id"
  | "parent_id"
  | "name"
  | "name_ar"
  | "slug"
  | "image_url"
  | "sort_order"
  | "is_active"
>

export interface CategoriesSummary {
  total: number
  active: number
  inactive: number
}
