import { z } from "zod"

// 1. المخطط الأساسي الذي يمثل قاعدة البيانات
export const categorySchema = z.object({
  id: z.uuid("invalid_id"),
  parent_id: z.uuid("invalid_parent_id").nullable(),
  name: z.string().min(1, "name_required"),
  name_ar: z.string().nullable(),
  slug: z
    .string()
    .min(1, "slug_required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug_invalid_format"),
  description: z.string().nullable(),

  // ✅ التعديل الذكي: نسمح بـ URL أو سلسلة فارغة، ونحول الفارغة تلقائياً إلى null
  image_url: z
    .string()
    .url("image_url_invalid_format") // ✅ أنصح بشدة باستخدام .url() بدلاً من Regex المعقد لأنه أكثر أماناً وشاملاً
    .nullable()
    .transform((val) => (val === "" ? null : val)),

  image_alt: z.string().nullable(),
  is_active: z.boolean(),
  sort_order: z.coerce
    .number()
    .int("sort_order_must_be_integer")
    .min(0, "sort_order_must_be_positive"),

  // ✅ تم إصلاح مشكلة التاريخ هنا
  created_at: z.string(),
  updated_at: z.string(),
})

// استنتاج النوع الأساسي
export type Category = z.infer<typeof categorySchema>

// 2. مخطط عملية الإنشاء (يستثني الحقول المولدة من السيرفر)
export const createCategorySchema = categorySchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
})

export type CreateCategoryInput = z.infer<typeof createCategorySchema>

// 3. مخطط عملية التحديث (يجعل جميع الحقول اختيارية ما عدا المعرف)
export const updateCategorySchema = categorySchema
  .omit({
    id: true,
    created_at: true,
    updated_at: true,
  })
  .partial()

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
