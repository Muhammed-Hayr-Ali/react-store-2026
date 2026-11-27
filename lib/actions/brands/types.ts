/**
 * @file lib/actions/brands/types.ts
 * @description TypeScript types and interfaces for Brands entity.
 */

import type { Tables } from "@/lib/database/supabase/types"

export type BrandRecord = Tables<"brands">

export interface BrandsSummary {
  total: number
  active: number
  inactive: number
}
