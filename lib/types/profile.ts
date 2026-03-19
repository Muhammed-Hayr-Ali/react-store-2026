// ===============================================================================
// File Name: profile.ts
// Description: Types for common
// Status: Active ✅
// Author: Mohammed Kher Ali
// Date: 2026-03-16
// Version: 1.0
// Copyright (c) 2026 Mohammed Kher Ali
// ===============================================================================

// ================================================================================
// Gender Type
// ================================================================================
export type Gender = "male" | "female" | "other" | "prefer_not_to_say"

// ================================================================================
// Profile Type
// ================================================================================
export type Profile = {
  // المعلومات الأساسية
  id: string
  email: string

  // مزود المصادقة
  provider: "email" | "google" | "facebook" | "github" | "apple" | string

  // معلومات الاتصال
  phone: string | null

  // الاسم
  first_name: string | null
  last_name: string | null
  full_name: string | null

  // المعلومات الشخصية
  gender: Gender | null
  date_of_birth: string | null
  bio: string | null

  // الصورة
  avatar_url: string | null

  // الإعدادات
  language: string
  timezone: string

  // حالة التحقق
  email_verified: boolean
  phone_verified: boolean

  // التوقيتات
  created_at: string
  updated_at: string
  last_login_at: string
}

// ================================================================================
// Update Profile Input Type
// ================================================================================
export type UpdateProfileInput = Partial<
  Omit<Profile, "id" | "email" | "created_at" | "updated_at" | "last_login_at">
>

// ===============================================================================
// Profile Completeness Type
// ===============================================================================
export type ProfileCompleteness = {
  score: number // 0-100
  missingFields: string[] // الحقول الناقصة
}

// ===============================================================================
// Profile Stats Type
// ===============================================================================
export type ProfileStats = {
  total_orders: number
  total_spent: number
  last_order_date: string | null
  wishlist_count: number
  review_count: number
}

// ===============================================================================
// Public Profile Type
// ===============================================================================
export type PublicProfile = Pick<
  Profile,
  | "id"
  | "email"
  | "first_name"
  | "last_name"
  | "full_name"
  | "avatar_url"
  | "bio"
  | "language"
  | "created_at"
>

// ===============================================================================
// End
// ================================================================================
