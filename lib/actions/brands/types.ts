import * as z from "zod"

export const brandSchema = z.object({
  name: z
    .string()
    .min(2, "الاسم مطلوب (حرفان على الأقل)")
    .max(100, "الاسم طويل جداً"),
  name_ar: z
    .string()
    .max(100, "الاسم العربي طويل جداً")
    .optional()
    .or(z.literal("")),
  slug: z
    .string()
    .min(2, "الرابط مطلوب")
    .max(100, "الرابط طويل جداً")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "الرابط يجب أن يحتوي على أحرف صغيرة وأرقام وشرطات فقط"
    ),
  logo_url: z
    .string()
    .regex(
      /^(https?:\/\/)?([\w-]+\.)?([a-zA-Z]{2,63}\.?|[a-zA-Z0-9-]{2,63}\.?)+[a-z]{2,63}(\/[\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/,
      "رابط غير صالح"
    )
    .optional()
    .or(z.literal("")),
  logo_alt: z
    .string()
    .max(255, "النص البديل طويل جداً")
    .optional()
    .or(z.literal("")),
})

export type Brand = {
  id: string
  name: string
  name_ar: string | null
  slug: string
  logo_url: string | null
  logo_alt: string | null
  created_at: string
  updated_at: string
}

export type CreateBrandData = z.infer<typeof brandSchema>
export type UpdateBrandData = Partial<CreateBrandData>
