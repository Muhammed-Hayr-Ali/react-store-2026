// lib/actions/reviews/types.ts

import { z } from "zod"

// ============================================================================
// 1. مخططات Zod (Schemas)
// ============================================================================

// مخطط التقييم الأساسي (كما يُخزّن في قاعدة البيانات)
export const reviewSchema = z.object({
  id: z.uuid("invalid_id"), // ✅ تصحيح: z.string().uuid
  product_id: z.uuid("invalid_product_id"), // ✅ تصحيح
  user_id: z.uuid("invalid_user_id"), // ✅ تصحيح
  rating: z.number().int().min(1, "rating_min_1").max(5, "rating_max_5"),
  comment: z.string().max(500, "comment_too_long").nullable(),
  created_at: z.string(),
})

export type Review = z.infer<typeof reviewSchema>

// مخطط إنشاء تقييم جديد (بدون الحقول المولدة من السيرفر)
export const createReviewSchema = z.object({
  product_id: z.uuid("invalid_product_id"), // ✅ تصحيح
  rating: z.number().int().min(1, "rating_min_1").max(5, "rating_max_5"),
  comment: z.string().max(500, "comment_too_long").optional().or(z.literal("")),
})

export type CreateReviewInput = z.infer<typeof createReviewSchema>

// ============================================================================
// 2. أنواع البيانات (Types) للاستخدام في الواجهة والخادم
// ============================================================================

// نوع يمثل ملخص التقييمات (المتوسط، العدد، التوزيع)
export type ReviewSummary = {
  averageRating: number
  totalReviews: number
  distribution: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
}

// نوع يمثل التقييم مع بيانات المستخدم من جدول profiles (للعرض في الواجهة)
export type ReviewWithProfile = {
  id: string
  product_id: string
  user_id: string
  rating: number
  comment: string | null
  created_at: string
  profile: {
    first_name: string | null
    last_name: string | null
    profile_image: string | null
  } | null
}

export const updateReviewSchema = z.object({
  id: z.string().uuid("invalid_id"),
  rating: z
    .number()
    .int()
    .min(1, "rating_min_1")
    .max(5, "rating_max_5")
    .optional(),
  comment: z.string().max(500, "comment_too_long").optional().or(z.literal("")),
})

export type UpdateReviewInput = z.infer<typeof updateReviewSchema>


export type ReviewDialogName = "create-review" | "edit-review" | "delete-review"





