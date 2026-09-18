// ✅ إزالة "use server" (مسموح فقط في ملفات الدوال)
// ✅ استخدام Named Import لضمان استنتاج الأنواع
import { z } from "zod"

// 1. المخطط الأساسي الذي يمثل قاعدة البيانات
export const categorySchema = z.object({
  id: z.string().uuid("invalid_id"),
  parent_id: z.string().uuid("invalid_parent_id").nullable(),
  name: z.string().min(1, "name_required"),
  name_ar: z.string().nullable(),
  slug: z
    .string()
    .min(1, "slug_required")
    .regex(/^[a-z0-9-]+$/, "slug_invalid_format"),
  description: z.string().nullable(),
  image_url: z.string().url("image_link_invalid").nullable().or(z.literal("")),
  image_alt: z.string().nullable(),
  is_active: z.boolean(),
  // ✅ استخدام z.coerce.number() لتحويل النصوص من النموذج إلى أرقام بأمان
  sort_order: z.coerce
    .number()
    .int("sort_order_must_be_integer")
    .min(0, "sort_order_must_be_positive"),
  created_at: z.string(),
  updated_at: z.string(),
})

// استنتاج النوع الأساسي
export type Category = z.infer<typeof categorySchema>

// 2. مخطط عملية الإنشاء
export const createCategorySchema = categorySchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
})
export type CreateCategoryInput = z.infer<typeof createCategorySchema>

// 3. مخطط عملية التحديث
export const updateCategorySchema = categorySchema
  .omit({
    id: true,
    created_at: true,
    updated_at: true,
  })
  .partial()
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
