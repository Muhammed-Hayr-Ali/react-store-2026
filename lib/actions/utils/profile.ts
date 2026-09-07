"use server"

import { ApiResult } from "@/lib/database/types/utils"
import { cache } from "react"
import { createServerClient } from "@/lib/database/supabase/server"

// ==========================================
// 1. تعريف الأنواع (Types)
// ==========================================

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

/**
 * يمثل بيانات المستخدم الحالي المجمعة من `auth.users` و `public.profiles`.
 */
export type CurrentUser = {
  id: string
  email: string | undefined
  first_name: string | null
  last_name: string | null
  profile_image: string | undefined
  role: "admin" | "customer" | "vendor" | "moderator"
}

// ==========================================
// 2. دوال إدارة البروفايل
// ==========================================

/**
 * يجلب بيانات المستخدم الحالي المجمعة.
 * تستخدم الدالة `cache` من React لضمان تنفيذ الاستعلام مرة واحدة فقط لكل طلب.
 * يجلب بيانات البروفايل الكاملة للمستخدم الحالي المسجل دخوله.
 * يتحقق من وجود جلسة مستخدم نشطة قبل محاولة جلب البيانات.
 *
 * @returns {Promise<ApiResult<Profile | null>>} كائن `ApiResult` يحتوي على:
 * - `success: true` و `data: Profile` في حالة النجاح.
 * - `success: true` و `data: null` إذا لم يتم العثور على بروفايل للمستخدم.
 * - `success: false` و `error: "UNAUTHORIZED"` إذا لم يكن المستخدم مسجل دخوله.
 * - `success: false` و `error: "FAILED_TO_FETCH_PROFILE"` في حالة حدوث خطأ آخر في الخادم.
 */

// ✅ cache() تضمن أن الاستعلام يُنفَّذ مرة واحدة فقط في كل طلب HTTP
// حتى لو استدعينا الدالة 100 مرة في الصفحة والـ Layout والمكونات الفرعية
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createServerClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  // جلب البروفايل (سيُخزن في الـ cache أيضاً إذا استخدمنا cache في دالة البروفايل)
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, profile_image, email")
    .eq("id", user.id)
    .single()

  return {
    id: user.id,
    email: user.email,
    first_name: profile?.first_name || null,
    last_name: profile?.last_name || null,
    profile_image: profile?.profile_image || null,
    role: user.app_metadata?.role || "customer",
  } as CurrentUser
})

export async function getProfile(): Promise<ApiResult<Profile | null>> {
  try {
    const supabase = await createServerClient()

    // التحقق من وجود جلسة مستخدم
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "UNAUTHORIZED" }
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        // خطأ "Not Found" في PostgREST
        return { success: true, data: null }
      }
      throw error
    }

    return { success: true, data: profile as Profile }
  } catch (error) {
    console.error("Error fetching current user profile:", error)
    return { success: false, error: "FAILED_TO_FETCH_PROFILE" }
  }
}

/**
 * يحدّث بيانات البروفايل للمستخدم الحالي المسجل دخوله.
 * يقوم بتصفية البيانات المدخلة للسماح فقط بالحقول المحددة في `UpdateProfileData`.
 *
 * @param {UpdateProfileData} data - كائن يحتوي على البيانات المراد تحديثها.
 * @returns {Promise<ApiResult<Profile | null>>} كائن `ApiResult` يحتوي على:
 * - `success: true` و `data: Profile` مع البيانات المحدثة في حالة النجاح.
 * - `success: false` و `error: "UNAUTHORIZED"` إذا لم يكن المستخدم مسجل دخوله.
 * - `success: false` و `error: "PHONE_NUMBER_ALREADY_EXISTS"` إذا كان رقم الهاتف مستخدماً بالفعل.
 * - `success: false` و `error: "FAILED_TO_UPDATE_PROFILE"` في حالة حدوث خطأ آخر في الخادم.
 */
export async function updateUserProfile(
  data: UpdateProfileData
): Promise<ApiResult<Profile | null>> {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "UNAUTHORIZED" }
    }

    // تصفية البيانات المسموح بتحديثها فقط (حماية ضد الحقن)
    const { first_name, last_name, phone_number, profile_image, gender } = data

    const updatePayload: Record<string, unknown> = {}
    if (first_name !== undefined) updatePayload.first_name = first_name
    if (last_name !== undefined) updatePayload.last_name = last_name
    if (phone_number !== undefined) updatePayload.phone_number = phone_number
    if (profile_image !== undefined) updatePayload.profile_image = profile_image
    if (gender !== undefined) updatePayload.gender = gender

    // إذا لم تكن هناك بيانات للتحديث، نعيد البروفايل الحالي
    if (Object.keys(updatePayload).length === 0) {
      return await getProfile()
    }

    const { data: updatedProfile, error } = await supabase
      .from("profiles")
      .update(updatePayload)
      .eq("id", user.id)
      .select()
      .single()

    if (error) {
      // معالجة خطأ انتهاك القيد الفريد (مثلاً: رقم هاتف مسجل مسبقاً)
      if (error.code === "23505") {
        return { success: false, error: "PHONE_NUMBER_ALREADY_EXISTS" }
      }
      throw error
    }

    return { success: true, data: updatedProfile as Profile }
  } catch (error) {
    console.error("Error updating profile:", error)
    return { success: false, error: "FAILED_TO_UPDATE_PROFILE" }
  }
}

/**
 * يجلب البروفايل العام لمستخدم معين بناءً على معرّف المستخدم (userId).
 * هذه الدالة آمنة للاستخدام من جانب العميل لأنها تستدعي دالة `get_public_profile_by_id`
 * في قاعدة البيانات، والتي تُرجع فقط الحقول المسموح بعرضها للعامة (الاسم الأول وصورة البروفايل).
 *
 * @param {string} userId - معرّف المستخدم (UUID) المراد جلب بياناته العامة.
 * @returns {Promise<ApiResult<PublicProfile | null>>} كائن `ApiResult` يحتوي على:
 * - `success: true` و `data: PublicProfile` في حالة النجاح.
 * - `success: true` و `data: null` إذا لم يتم العثور على بروفايل للمستخدم.
 * - `success: false` و `error: "FAILED_TO_FETCH_PUBLIC_PROFILE"` في حالة حدوث خطأ في الخادم.
 */
export async function getPublicProfile(
  userId: string
): Promise<ApiResult<PublicProfile | null>> {
  try {
    const supabase = await createServerClient()

    // نستخدم rpc لاستدعاء الدالة الآمنة get_public_profile_by_id التي أنشأناها في SQL
    const { data, error } = await supabase
      .rpc("get_public_profile_by_id", { p_user_id: userId })
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return { success: true, data: null }
      }
      throw error
    }

    return { success: true, data: data as PublicProfile }
  } catch (error) {
    console.error("Error fetching public profile:", error)
    return { success: false, error: "FAILED_TO_FETCH_PUBLIC_PROFILE" }
  }
}
