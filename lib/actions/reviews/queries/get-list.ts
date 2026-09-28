"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { ReviewWithProfile } from "../types"

/**
 * جلب قائمة تقييمات منتج معين مع بيانات المستخدم من جدول profiles
 * (طريقة مضمونة 100%: جلب التقييمات أولاً، ثم جلب البروفايلات ودمجها)
 */
export async function getProductReviewsList(
  productId: string
): Promise<ApiResult<ReviewWithProfile[]>> {
  if (!productId || typeof productId !== "string") {
    return {
      success: false,
      error: "INVALID_ID_PROVIDED",
      details: { database: ["معرف المنتج مطلوب"] },
    }
  }

  const supabase = await createServerClient()

  // الخطوة 1: جلب التقييمات فقط (بدون أي محاولة للربط مع profiles)
  const { data: reviews, error: reviewsError } = await supabase
    .from("product_reviews")
    .select("id, product_id, user_id, rating, comment, created_at")
    .eq("product_id", productId)
    .order("created_at", { ascending: false })

  if (reviewsError) {
    return {
      success: false,
      error: "FETCH_REVIEWS_ERROR",
      details: { database: [reviewsError.message] },
    }
  }

  // إذا لم تكن هناك تقييمات، نرجع مصفوفة فارغة فوراً
  if (!reviews || reviews.length === 0) {
    return { success: true, data: [] }
  }

  // الخطوة 2: استخراج معرفات المستخدمين الفريدة من التقييمات
  const userIds = Array.from(new Set(reviews.map((r) => r.user_id)))

  // الخطوة 3: جلب بيانات البروفايلات لهؤلاء المستخدمين فقط
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, profile_image")
    .in("id", userIds)

  if (profilesError) {
    // حتى لو فشل جلب البروفايل، نرجع التقييمات بدون معلومات المستخدم بدلاً من فشل الطلب كاملاً
    console.error("Error fetching profiles:", profilesError)
  }

  // الخطوة 4: إنشاء خريطة (Map) للبروفايلات للوصول السريع O(1)
  const profilesMap = new Map((profiles || []).map((p) => [p.id, p]))

  // الخطوة 5: دمج البيانات: إضافة البروفايل المناسب لكل تقييم
  const reviewsWithProfiles: ReviewWithProfile[] = reviews.map((review) => ({
    ...review,
    profile: profilesMap.get(review.user_id) || null,
  }))

  return { success: true, data: reviewsWithProfiles }
}
