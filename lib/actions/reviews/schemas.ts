/**
 * @file lib/actions/reviews/schemas.ts
 * @description Zod schemas for validating product review operations (create, update & moderate).
 */

import { z } from "zod"

// مخطط إضافة تعليق وتقييم جديد من قبل المستخدم
export const createReviewSchema = z.object({
  product_id: z.string().uuid("INVALID_PRODUCT_ID"),
  rating: z.number().int().min(1, "MIN_RATING").max(5, "MAX_RATING"),
  content: z.string().min(3, "CONTENT_TOO_SHORT").max(1000, "CONTENT_TOO_LONG"),
})

export type CreateReviewInput = z.infer<typeof createReviewSchema>

// مخطط تحديث محتوى وتقييم التعليق (للمالك أو المشرف)
export const updateReviewSchema = z.object({
  reviewId: z.string().uuid("INVALID_REVIEW_ID"),
  rating: z.number().int().min(1, "MIN_RATING").max(5, "MAX_RATING"),
  content: z
    .string()
    .min(3, "CONTENT_TOO_SHORT")
    .max(1000, "CONTENT_TOO_LONG")
    .optional()
    .nullable(),
})

export type UpdateReviewInput = z.infer<typeof updateReviewSchema>

// مخطط تحديث حالة التعليق (القبول أو الرفض) من قبل المشرف في لوحة التحكم
export const updateReviewStatusSchema = z.object({
  id: z.string().uuid("INVALID_REVIEW_ID"),
  is_approved: z.boolean(),
})

export type UpdateReviewStatusInput = z.infer<typeof updateReviewStatusSchema>

// مخطط جلب التعليقات مع خيارات الفلترة
export const getReviewsSchema = z.object({
  includePending: z.boolean().optional(),
  productId: z.string().uuid("INVALID_PRODUCT_ID").optional(),
})

export type GetReviewsInput = z.infer<typeof getReviewsSchema>
