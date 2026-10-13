/**
 * @file lib/actions/categories/types.ts
 * @description TypeScript types and interfaces for Categories management.
 * Fully synchronized with database schema and Zod validation schemas.
 */

import { z } from "zod"
import type { Tables } from "../types/database"
import { categoryFormSchema } from "./schemas"

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
