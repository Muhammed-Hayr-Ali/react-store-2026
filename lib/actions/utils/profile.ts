"use server"

import { ApiResult } from "@/lib/database/types/utils"
import { cache } from "react"
import { createServerClient } from "@/lib/database/supabase/server"

export type Profile = {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  phone_number: string | null
  profile_image: string | null
  gender: "male" | "female" | "other" | null
  phone_verified_at: string | null
  email_verified_at: string | null
  created_at: string
  updated_at: string
}

export type UpdateProfileData = Partial<
  Pick<
    Profile,
    "first_name" | "last_name" | "phone_number" | "profile_image" | "gender"
  >
>

export type PublicProfile = {
  id: string
  first_name: string | null
  profile_image: string | null
}

export type CurrentUser = {
  id: string
  email: string | undefined
  first_name: string | null
  last_name: string | null
  profile_image: string | undefined
  role: "admin" | "customer" | "vendor" | "moderator"
}

/**
 * جلب بيانات المستخدم الحالي مع التعامل الاحترافي مع أخطاء الجلسة والـ Tokens التالفة.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  try {
    const supabase = await createServerClient()

    // 1. التحقق من المستخدم الحالي عبر سيرفر Supabase بأمان
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    // إذا وُجد خطأ في المصادقة أو لم يكن هناك مستخدم، نعيد null دون إيقاف تشغيل الخادم
    if (userError || !user) {
      return null
    }

    // 2. جلب بيانات البروفايل التابعة للمستخدم
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, profile_image, email")
      .eq("id", user.id)
      .maybeSingle()

    return {
      id: user.id,
      email: user.email,
      first_name: profile?.first_name || null,
      last_name: profile?.last_name || null,
      profile_image: profile?.profile_image || null,
      role: (user.app_metadata?.role as CurrentUser["role"]) || "customer",
    }
  } catch (error) {
    // التقاط ومعالجة أي استثناء صادر عن AuthApiError
    return null
  }
})

export async function getProfile(): Promise<ApiResult<Profile | null>> {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, error: "UNAUTHORIZED" }
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()

    if (error) {
      throw error
    }

    return { success: true, data: profile as Profile }
  } catch {
    return { success: false, error: "FAILED_TO_FETCH_PROFILE" }
  }
}
