import * as z from "zod"

// Profile
// {
//    "id":"b07bdbdb-9b33-4fa5-8815-667298234096",
//    "first_name":"Mohammed kher",
//    "last_name":null,
//    "email":"m.thelord963@gmail.com",
//    "phone_number":null,
//    "profile_image":"https://cdnimages.shemaletubevideos.com/images/galleries/0108/19234/584e92bcfd4e0f3460535613332c627a.jpg",
//    "gender":"other",
//    "phone_verified_at":null,
//    "email_verified_at":null,
//    "created_at":"2026-08-07T22:19:14.933979+00:00",
//    "updated_at":"2026-08-15T22:48:58.003784+00:00"
// }

// 1. الـ Schema الكامل المطابق لجدول profiles في قاعدة البيانات
export const profileSchema = z.object({
  id: z.uuid(),
  first_name: z.string().nullish(),
  last_name: z.string().nullish(),
  email: z.email().nullish(),
  phone_number: z.string().nullish(),
  profile_image: z.string().nullish(),
  gender: z.enum(["male", "female", "other"]).nullish(),
  phone_verified_at: z.coerce.date().nullish(),
  email_verified_at: z.coerce.date().nullish(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
})

// 2. استخدام .pick() لاستخراج الحقول المطلوبة فقط (للواجهة العامة)
export const publicProfileSchema = profileSchema.pick({
  id: true,
  first_name: true,
  last_name: true,
  email: true,
  profile_image: true,
})

// 3. استخراج نوع TypeScript للاستخدام في Next.js / React
export type Profile = z.infer<typeof profileSchema>
export type PublicProfile = z.infer<typeof publicProfileSchema>
