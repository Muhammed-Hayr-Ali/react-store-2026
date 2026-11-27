/**
 * @file lib/actions/reviews/types.ts
 * @description TypeScript interfaces for product reviews returned by Supabase.
 */

import type { Tables } from "@/lib/database/supabase/types"

export type ProductReview = Tables<"product_reviews">

export type ReviewWithUser = ProductReview & {
  user: Pick<
    Tables<"profiles">,
    "first_name" | "last_name" | "avatar"
  > | null
}

export interface ReviewsSummary {
  total: number
  approved: number
  pending: number
}
