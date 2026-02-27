"use server";

import { unstable_noStore as noStore, revalidatePath } from "next/cache";
import { createServerClient } from "../supabase/createServerClient";
import { getUser } from "./get-user-action";
import { siteConfig } from "../config/site";

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
  name?: string;
  email?: string;
  product_id: string;
  user_id?: string;
  rating: number;
  title?: string;
  comment: string;
  is_verified_purchase: boolean;
  is_published?: boolean;
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
export type ReviewPayload = Omit<
  Review,
  | "id"
  | "user_id"
  | "is_verified_purchase"
  | "is_published"
  | "author"
  | "created_at"
>;

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
// ===============================================================================
// Create Review
// ===============================================================================
export async function createReview({
  productSlug,
  payload,
}: {
  productSlug: string;
  payload: ReviewPayload;
}): Promise<ApiResponse<boolean>> {
  let userId: string | null = null;
  let isPublished: boolean = false;
  const isVerifiedPurchase = await checkUserPurchase(payload.product_id);

  // Initialize Supabase client for server-side operations
  const supabase = await createServerClient();
  // Fetch the currently authenticated user to ensure we have a valid session and user ID
  const { data: user, error: userError } = await getUser();
  // Critical error handling: If we fail to fetch the user, we cannot proceed with adding a new address
  if (user && !userError) {
    userId = user.id;
    isPublished = siteConfig.postUserComments;
  } else {
    isPublished = siteConfig.postGuestComments;
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
    is_published: isPublished,
    is_verified_purchase: isVerifiedPurchase,
  });

  if (insertError) {
    console.error("Error inserting review:", insertError.message);
    return { error: "Failed to add review." };
  }

  revalidatePath(`/products/${productSlug}`);

  return { data: true };
}

//================================================================================
// Get User Reviews
//================================================================================
export async function getReviews(): Promise<ApiResponse<Review[]>> {
  // Initialize Supabase client for server-side operations
  const supabase = await createServerClient();
  // Fetch the currently authenticated user to ensure we have a valid session and user ID
  const { data: user, error: userError } = await getUser();
  // Critical error handling: If we fail to fetch the user, we cannot proceed with fetching addresses
  if (userError || !user) {
    console.error("AUTHENTICATION_FAILED");
    return { error: "AUTHENTICATION_FAILED" };
  }
  // Fetch reviews for the authenticated user
  const { data: userReviews, error: reviewsError } = await supabase
    .from("reviews")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Critical error handling: If we fail to fetch reviews, we log the error and return a user-friendly message
  if (reviewsError) {
    console.error("Error fetching user reviews:", reviewsError);
    return { error: "Failed to fetch user reviews." };
  }
  // Return the fetched reviews in a consistent API response format
  return { data: userReviews };
}

//================================================================================
// Update Review
//================================================================================
export async function updateReview(
  id: number,
  formData: ReviewPayload,
): Promise<ApiResponse<boolean>> {
  // Initialize Supabase client for server-side operations
  const supabase = await createServerClient();
  // Fetch the currently authenticated user to ensure we have a valid session and user ID
  const { data: user, error: userError } = await getUser();
  // Critical error handling: If we fail to fetch the user, we cannot proceed with updating the reviews
  if (userError || !user) {
    console.error("AUTHENTICATION_FAILED");
    return { error: "AUTHENTICATION_FAILED" };
  }
  // Update the address for the authenticated user
  const { error } = await supabase
    .from("reviews")
    .update(formData)
    .eq("id", id)
    .eq("user_id", user.id);
  // Critical error handling: If we fail to update the review, we log the error and return a user-friendly message
  if (error) {
    console.error("Error updating review:", error.message);
    return { error: "Failed to update review." };
  }

  return { data: true };
}

// =================================================================
// GET REVIEWS BY PRODUCT ID
// =================================================================

export async function getReviewsByProductId(
  productId: string,
): Promise<ApiResponse<Review[]>> {
  //Don't cache this route
  noStore();

  const supabase = await createServerClient(); // بدون await

  const { data: reviews, error: errorReviews } = await supabase
    .from("reviews")
    .select(GET_REVIEWS_BY_PRODUCT_ID_QUERY)
    .eq("product_id", productId)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (errorReviews) {
    console.error("Error fetching reviews:", errorReviews.message);
    return { error: "Failed to fetch reviews." };
  }

  return { data: reviews };
}

// =================================================================
// REVIEW DELETION ACTION
// =================================================================

export async function deleteReview(
  reviewId: number,
  productSlug: string,
): Promise<ApiResponse<boolean>> {
  const supabase = await createServerClient();
  // Fetch the currently authenticated user to ensure we have a valid session and user ID
  const { data: user, error: userError } = await getUser();
  // Critical error handling: If we fail to fetch the user, we cannot proceed with fetching addresses
  if (userError || !user) {
    // console.error("AUTHENTICATION_FAILED");
    return { error: "AUTHENTICATION_FAILED" };
  }
  //
  const { error } = await supabase
    .from("reviews")
    .delete()
    .match({
      id: Number(reviewId),
      user_id: user.id, // 🛑 The most important security check!
    });

  // Critical error handling: If we fail to delete the address, we log the error and return a user-friendly message
  if (error) {
    console.error("Error deleting review:", error);
    return {
      error: "Failed to delete your review. Please try again.",
    };
  }

  // 4. إعادة التحقق من المسار لتحديث الواجهة فورًا
  revalidatePath(`/products/${productSlug}`);
  revalidatePath(`/[locale]/products/${productSlug}`);

  return { data: true };
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

// // =================================================================
// // GET USER REVIEWS SUMMARY
// // =================================================================

// export type ReviewsSummary = {
//   totalReviews: number;
//   latestReview: {
//     id: number;
//     rating: number;
//     title: string | null;
//     product: {
//       name: string;
//       slug: string;
//     };
//   } | null;
// };

// =================================================================
// HELPER FUNCTION FOR PURCHASE VERIFICATION
// =================================================================
export async function checkUserPurchase(
  productId: string,
): Promise<boolean> {
  const supabase = await createServerClient();

  const { data, error } = await supabase.rpc("did_user_purchase_product", {
    p_product_id: productId,
  });

  console.log(data);
  if (error) {
    console.error(
      "Error calling DB function 'did_user_purchase_product':",
      error,
    );
    return false;
  }
  return data;
}
