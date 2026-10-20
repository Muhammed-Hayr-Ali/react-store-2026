/**
 * @file lib/actions/reviews/types.ts
 * @description TypeScript interfaces for product reviews returned by Supabase.
 */

export interface ProductReview {
  id: string
  product_id: string
  user_id: string | null
  rating: number
  content: string
  is_approved: boolean
  created_at: string
  updated_at: string
}

// تحديث الواجهة لتطابق أعمدة جدول profiles الحقيقية
export interface ReviewWithUser extends ProductReview {
  user?: {
    first_name?: string | null
    last_name?: string | null
    profile_image?: string | null
  } | null
}

export interface ReviewsSummary {
  total: number
  approved: number
  pending: number
}