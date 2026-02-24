"use server";

import { unstable_noStore as noStore, revalidatePath } from "next/cache";
import { createServerClient } from "../supabase/createServerClient";
import { getUser } from "./get-user-action";

// ===============================================================================
// Api Response Type
// ===============================================================================
export type ApiResponse<T> = {
  data?: T;
  error?: string;
};

// ===============================================================================
// Review Type
// ===============================================================================

export type Review = {
  id: number;
  name: string;
  email: string;
  product_id: string;
  user_id?: string;
  rating: number;
  title: string;
  comment: string;
  is_verified_purchase: boolean;
  author?: Author;
  created_at: Date;
};

export type Author = {
  id: string;
  last_name: string;
  avatar_url: string;
  first_name: string;
};

// ===============================================================================
// createReview Payload Type
// ===============================================================================
export type CreateReviewPayload = {
  name?: string;
  email?: string;
  product_id: string;
  rating?: number;
  title: string;
  comment: string;
  product_slug: string;
  is_verified_purchase: boolean;
};

// ===============================================================================
// Create Review
// ===============================================================================
export async function createReview(
  payload: CreateReviewPayload,
): Promise<ApiResponse<boolean>> {

  const product_slug = payload.product_slug;
  let userId: string | null = null;

  // Initialize Supabase client for server-side operations
  const supabase = await createServerClient();
  // Fetch the currently authenticated user to ensure we have a valid session and user ID
  const { data: user, error: userError } = await getUser();
  // Critical error handling: If we fail to fetch the user, we cannot proceed with adding a new address
  if (user && !userError) {
    userId = user.id;
  }


  // 4. إدراج البيانات في قاعدة البيانات
  const { error: insertError } = await supabase.from("reviews").insert({
    product_id: payload.product_id,
    user_id: userId,
    name: payload.name,
    email: payload.email,
    rating: payload.rating,
    title: payload.title,
    comment: payload.comment,
    is_verified_purchase: payload.is_verified_purchase
  });

  if (insertError) {
    console.error("Error inserting review:", insertError.message);
    return { error: "Failed to add review." };
  }

  revalidatePath(`/products/${product_slug}`);

  return { data: true };


}

// =================================================================
// GET REVIEWS BY PRODUCT ID Query
// =================================================================
const GET_REVIEWS_BY_PRODUCT_ID_QUERY = `
      *,
      author:profiles (
        id,
        first_name,
        last_name,
        avatar_url
      )
    `;

// =================================================================
// GET REVIEWS BY PRODUCT ID
// =================================================================

export async function getReviewsByProductId(
  productId: string,
): Promise<ApiResponse<Review[] | []>> {
  //Don't cache this route
  noStore();

  const supabase = await createServerClient(); // بدون await

  const { data: reviews, error: errorReviews } = await supabase
    .from("reviews")
    .select(GET_REVIEWS_BY_PRODUCT_ID_QUERY)
    .eq("product_id", productId)
    .eq("is_verified_purchase", true)
    .order("created_at", { ascending: false });

  if (errorReviews) {
    console.error("Error fetching reviews:", errorReviews.message);
    return { error: "Failed to fetch reviews." };
  }

  return { data: reviews };
}

// =================================================================
// HELPER FUNCTION FOR PURCHASE VERIFICATION
// =================================================================
export async function checkUserPurchase(
  userId: string,
  productId: string, // هذا هو ID المنتج الرئيسي
): Promise<boolean> {
  const supabase = await createServerClient();

  // الاستعلام الجديد والمُصحح
  const { data, error } = await supabase
    .from("order_items")
    .select(
      `
      id,
      order:orders!inner ( user_id ),
      variant:product_variants!inner ( product_id )
    `,
    )
    .eq("order.user_id", userId) // هل الطلب يخص هذا المستخدم؟
    .eq("variant.product_id", productId) // هل هذا المتغير يخص المنتج الذي نراجعه؟
    .limit(1)
    .single();

  if (error) {
    if (error.code !== "PGRST116") {
      console.error("Error checking user purchase (Corrected Query):", error);
    }
    return false;
  }

  return data !== null;
}

// =================================================================
// REVIEW SUBMISSION ACTION (WITH VERIFIED PURCHASE LOGIC)
// =================================================================

// دالة إضافة التقييم الجديدة مع التحقق اليدوي
export async function addReview(
  formData: FormData,
  productId: string,
  productSlug: string,
): Promise<ApiResponse<boolean>> {
  // Initialize Supabase client for server-side operations
  const supabase = await createServerClient();
  // Fetch the currently authenticated user to ensure we have a valid session and user ID
  const { data: user } = await getUser();
  // Critical error handling: If we fail to fetch the user, we cannot proceed with adding a new address

  let userId: string | null = null;
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  let isVerified = false;
  const ratingNum = parseInt(formData.get("rating") as string);
  const title = formData.get("title") as string;
  const comment = formData.get("comment") as string;

  if (user) {
    userId = user.id;
    isVerified = await checkUserPurchase(user.id, productId);
  }

  // 4. إدراج البيانات في قاعدة البيانات
  const { error: insertError } = await supabase.from("reviews").insert({
    product_id: productId,
    user_id: userId,
    name: name,
    email: email,
    rating: ratingNum,
    title: title,
    comment: comment,
    is_verified_purchase: isVerified,
  });

  if (insertError) {
    console.error("Error adding review:", insertError);
    return {
      error: "Failed to submit your review. Please try again.",
    };
  }

  // 5. إعادة التحقق من المسار لتحديث الواجهة
  revalidatePath(`/products/${productSlug}`);

  return {
    data: true,
  };
}

// getAllUserReviews;

// =================================================================
// REVIEW DELETION ACTION
// =================================================================

export async function deleteReview(
  formData: FormData,
): Promise<{ success: boolean; message: string }> {
  const supabase = await createServerClient();

  // 1. التحقق من وجود مستخدم مسجل
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      success: false,
      message: "You must be logged in to perform this action.",
    };
  }

  // 2. استخراج البيانات من النموذج
  const reviewId = formData.get("reviewId");
  const productSlug = formData.get("productSlug");

  if (!reviewId || typeof reviewId !== "string") {
    return { success: false, message: "Invalid review ID." };
  }
  if (!productSlug || typeof productSlug !== "string") {
    return { success: false, message: "Product slug is missing." };
  }

  // 3. تنفيذ الحذف مع شرط أمان حاسم
  //    نحن نحذف فقط إذا كان `id` يطابق و `user_id` يطابق المستخدم الحالي.
  //    هذا يمنع أي مستخدم من حذف تقييمات الآخرين.
  const { error } = await supabase
    .from("reviews")
    .delete()
    .match({
      id: Number(reviewId),
      user_id: user.id, // 🛑 The most important security check!
    });

  if (error) {
    console.error("Error deleting review:", error);
    return {
      success: false,
      message: "Failed to delete your review. Please try again.",
    };
  }

  // 4. إعادة التحقق من المسار لتحديث الواجهة فورًا
  revalidatePath(`/products/${productSlug}`);
  revalidatePath(`/[locale]/products/${productSlug}`);

  return { success: true, message: "Your review has been deleted." };
}

// =================================================================
// TYPES AND DATA FETCHING
// =================================================================

// ✅ --- تعريف نوع جديد لتقييمات المستخدم ---
export type UserReview = Review & {
  product: {
    name: string;
    slug: string;
    main_image_url: string | null;
  };
};

// ✅ --- الدالة المفقودة التي سنقوم بإضافتها الآن --- ✅
/**
 * يجلب جميع التقييمات التي كتبها المستخدم الحالي.
 * @returns Promise<UserReview[]>
 */
export async function getAllUserReviews(): Promise<UserReview[]> {
  noStore();
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return []; // إذا لم يكن هناك مستخدم، أرجع مصفوفة فارغة
  }

  const { data, error } = await supabase
    .from("reviews")
    .select(
      `
      *,
      product:products!inner (
        name,
        slug,
        main_image_url
      )
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all user reviews:", error.message);
    return []; // في حالة حدوث خطأ، أرجع مصفوفة فارغة
  }

  // Supabase قد يُرجع null حتى لو لم يكن هناك خطأ، لذلك نتحقق من ذلك
  return data || [];
}

// =================================================================
// GET USER REVIEWS SUMMARY
// =================================================================

export type ReviewsSummary = {
  totalReviews: number;
  latestReview: {
    id: number;
    rating: number;
    title: string | null;
    product: {
      name: string;
      slug: string;
    };
  } | null;
};
