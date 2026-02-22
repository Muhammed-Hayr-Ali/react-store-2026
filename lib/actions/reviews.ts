"use server";

import { unstable_noStore as noStore, revalidatePath } from "next/cache";
import { createServerClient } from "../supabase/createServerClient";



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
  created_at: Date;
  product_id: string;
  user_id: string;
  rating: number;
  title: string;
  comment: string;
  is_verified_purchase: boolean;
  author: Author;
};

export type Author = {
  id: string;
  last_name: string;
  avatar_url: string;
  first_name: string;
};



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
    .select(
      `
      *,
      author:profiles (
        id,
        first_name,
        last_name,
        avatar_url
      )
    `,
    )
    .eq("product_id", productId)
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

/**
 * يتحقق مما إذا كان المستخدم قد اشترى منتجًا معينًا.
 * @param userId - معرف المستخدم.
 * @param productId - معرف المنتج.
 * @returns Promise<boolean> - `true` إذا كان قد اشترى المنتج، وإلا `false`.
 */
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

// نوع حالة النموذج
export type ReviewFormState = {
  message: string;
  success: boolean;
  errors?: {
    rating?: string[];
    title?: string[];
    comment?: string[];
    productId?: string[];
    productSlug?: string[];
  };
};

// دالة إضافة التقييم الجديدة مع التحقق اليدوي
export async function addReview(
  prevState: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  const supabase = await createServerClient();

  // 1. التحقق من وجود مستخدم مسجل
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      success: false,
      message: "You must be logged in to leave a review.",
    };
  }

  // 2. استخراج البيانات والتحقق اليدوي
  const errors: ReviewFormState["errors"] = {};
  const rating = formData.get("rating");
  const title = formData.get("title");
  const comment = formData.get("comment");
  const productId = formData.get("productId");
  const productSlug = formData.get("productSlug");

  const ratingNum = Number(rating);
  if (!rating || isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    errors.rating = ["Rating is required and must be between 1 and 5."];
  }
  if (title && typeof title === "string" && title.length > 100) {
    errors.title = ["Title cannot be longer than 100 characters."];
  }
  if (comment && typeof comment === "string" && comment.length > 1000) {
    errors.comment = ["Comment cannot be longer than 1000 characters."];
  }
  if (!productId || typeof productId !== "string") {
    errors.productId = ["Product ID is missing or invalid."];
  }
  if (!productSlug || typeof productSlug !== "string") {
    errors.productSlug = ["Product slug is missing."];
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: "Invalid form data. Please check your input.",
      errors,
    };
  }

  // ✅ 3. التحقق مما إذا كان المستخدم قد اشترى المنتج
  const isVerified = await checkUserPurchase(user.id, productId as string);

  // 4. إدراج البيانات في قاعدة البيانات
  const { error: insertError } = await supabase.from("reviews").insert({
    product_id: productId as string,
    user_id: user.id,
    rating: ratingNum,
    title: (title as string) || null,
    comment: (comment as string) || null,
    is_verified_purchase: isVerified, // ✅ استخدام النتيجة هنا
  });

  if (insertError) {
    console.error("Error adding review:", insertError);
    if (insertError.code === "23505") {
      return {
        success: false,
        message: "You have already reviewed this product.",
      };
    }
    return {
      success: false,
      message: "Failed to submit your review. Please try again.",
    };
  }

  // 5. إعادة التحقق من المسار لتحديث الواجهة
  revalidatePath(`/products/${productSlug}`);
  revalidatePath(`/[locale]/products/${productSlug}`);

  return {
    success: true,
    message: "Thank you! Your review has been submitted.",
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
