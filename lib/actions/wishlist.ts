"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "../supabase/createServerClient";
import { unstable_noStore as noStore } from "next/cache";
import { getUser } from "./get-user-action";


// =================================================================
// Generic API Response Type
// =================================================================
export type ApiResponse<T> = {
  data?: T;
  error?: string;
};
// =================================================================
// Wishlist types
// =================================================================
export type WishlistItem = {
  id: string;
  user_id: string;
  product_id: string;
  created_at: Date;
  product: ProductRaw;
};

type ProductRaw = {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  main_image_url: string | null;
  created_at: string;
  variants: {
    id: string;
    price: number;
    discount_price: number | null;
    is_default: boolean;
    stock_quantity?: number;
    image_url?: string;
  }[];
  reviews: { rating: number }[];
};

// ✅ نوع للمنتج بعد المعالجة (الذي سيستخدمه الـ UI)
export type ProcessedProduct = {
  id?: string;
  name: string;
  slug: string;
  short_description: string | null;
  main_image_url: string | null;
  created_at: string;

  variant_id: string;

  // ✅ بيانات محسوبة من المتغير الافتراضي
  price: number;
  discount_price: number | null;
  discountPercentage: number | null;
  stock_quantity: number;
  variant_image: string | null;

  // ✅ بيانات التقييمات
  average_rating: number;
  total_reviews: number;
};

// =================================================================
// Wishlist Queries
// =================================================================

const WISHLIST_QUERY = `*, 
      product:products(
      id,
      name,
      slug,
      short_description,
      main_image_url,
      created_at,
      variants:product_variants (
        id,
        price,
        discount_price,
        is_default,
        stock_quantity,
        image_url
      ),
      reviews:reviews (
        rating
      )
    )`;

// =================================================================
// Check if UUID is valid Helper functions
// =================================================================
const isValidUUID = (uuid: string): boolean => {
  const regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return regex.test(uuid);
};

// =================================================================
// Get wishlist items for the authenticated user
// =================================================================
export async function getWishlist(): Promise<ApiResponse<ProcessedProduct[]>> {
  noStore(); // Ensure this action is not cached and always runs on the server for real-time data

  // Initialize Supabase client for server-side operations
  const supabase = await createServerClient();
  // Fetch the currently authenticated user to ensure we have a valid session and user ID
  const { data: user, error: userError } = await getUser();
  // Critical error handling: If we fail to fetch the user, we cannot proceed with fetching addresses
  if (userError || !user) {
    console.error("Error fetching user:", userError);
    return { error: "Authentication failed." };
  }
  // Fetch wishlist items for the authenticated user, including related product data
  const { data, error } = await supabase
    .from("wishlist_items")
    .select(WISHLIST_QUERY)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error fetching wishlist items:", error);
    return { error: "Failed to fetch wishlist items." };
  }

  // convert wishlist items List to Product List
  const products = data.map((item) => item.product);

  // convert Product List to ProcessedProduct List
  const processedProducts: ProcessedProduct[] = products.map(
    (product: ProductRaw) => {
      const defaultVariant = product.variants?.find(
        (v) => v.is_default === true,
      );

      const variantId = defaultVariant?.id || "";

      const reviews = product.reviews || [];
      const averageRating =
        reviews.length > 0
          ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
            reviews.length
          : 0;

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        short_description: product.short_description,
        main_image_url: product.main_image_url,
        created_at: product.created_at,

        variant_id: variantId,
        price: defaultVariant?.price || 0,
        discount_price: defaultVariant?.discount_price ?? null,
        stock_quantity: defaultVariant?.stock_quantity || 0,
        variant_image: defaultVariant?.image_url || null,

        discountPercentage:
          defaultVariant?.discount_price && defaultVariant?.price
            ? Math.floor(
                ((defaultVariant.price - defaultVariant.discount_price) /
                  defaultVariant.price) *
                  100,
              )
            : null,

        // بيانات التقييم
        average_rating: parseFloat(averageRating.toFixed(1)),
        total_reviews: reviews.length,
      };
    },
  );

  // Return the wishlist items
  return { data: processedProducts };
}

// =================================================================
// Add to Wishlist
// =================================================================
export async function addToWishlist(
  productId: string,
): Promise<ApiResponse<boolean>> {
  // Check if productId is provided
  if (!productId) {
    console.error("Product ID is required.");
    return { error: "Product ID is required." };
  }
  // Initialize Supabase client for server-side operations
  const supabase = await createServerClient();
  // Fetch the currently authenticated user to ensure we have a valid session and user ID
  const { data: user, error: userError } = await getUser();
  // Critical error handling: If we fail to fetch the user, we cannot proceed with fetching addresses
  if (userError || !user) {
    console.error("Error fetching user:", userError);
    return { error: "Authentication failed." };
  }

  // Add the product to the wishlist
  const { error } = await supabase
    .from("wishlist_items")
    .insert({ product_id: productId, user_id: user.id });

  // Critical error handling: Handle duplicate entries gracefully and log other errors
  if (error) {
    if (error.code === "23505") {
      console.warn("Attempted to add duplicate item to wishlist:", productId);
      return {
        error: "This item is already in your wishlist.",
      };
    }
    console.error("Error adding to wishlist:", error.message);
    return { error: "Failed to add item to wishlist." };
  }

  // Revalidate the wishlist page
  revalidatePath("/wishlist");
  return { data: true };
}

// =================================================================
//Remove from Wishlist
// =================================================================
export async function removeFromWishlist(
  productId: string,
): Promise<ApiResponse<boolean>> {
  // Check if productId is provided
  if (!productId) {
    console.error("Product ID is required.");
    return { error: "Product ID is required." };
  }
  // Initialize Supabase client for server-side operations
  const supabase = await createServerClient();
  // Fetch the currently authenticated user to ensure we have a valid session and user ID
  const { data: user, error: userError } = await getUser();
  // Critical error handling: If we fail to fetch the user, we cannot proceed with fetching addresses
  if (userError || !user) {
    console.error("Error fetching user:", userError);
    return { error: "Authentication failed." };
  }

  // Remove the product from the wishlist
  const { error } = await supabase
    .from("wishlist_items")
    .delete()
    .eq("product_id", productId)
    .eq("user_id", user.id);

  // Critical error handling: Handle duplicate entries gracefully and log other errors
  if (error) {
    console.error("Error removing from wishlist:", error.message);
    return { error: "Failed to remove item from wishlist." };
  }

  // Revalidate the wishlist page
  revalidatePath("/wishlist");
  // No need to return data here, but we can return a success flag if desired
  return { data: true };
}

// =================================================================
// Check if Products is Wishlisted
// =================================================================
export async function checkWishlistStatus(
  productIds: string[],
): Promise<ApiResponse<Record<string, boolean>>> {
  // Check if productIds is provided
  if (!productIds || productIds.length === 0) {
    return { error: "Product IDs are required." };
  }

  // Filter out invalid UUIDs before querying the database
  const validIds = productIds.filter((id) => isValidUUID(id));
  const invalidIds = productIds.filter((id) => !isValidUUID(id));

  // Log a warning if any invalid UUIDs are found
  if (invalidIds.length > 0) {
    console.warn(
      `⚠️ Warning: Ignored ${invalidIds.length} invalid UUID(s) in wishlist check:`,
      invalidIds,
    );
  }

  // Critical handling: If all provided IDs are invalid, we can return false for all of them without querying the database
  if (validIds.length === 0) {
    const emptyStatusMap: Record<string, boolean> = {};
    productIds.forEach((id) => (emptyStatusMap[id] = false));
    return { data: emptyStatusMap };
  }

  const supabase = await createServerClient();
  const { data: user, error: userError } = await getUser();

  if (userError || !user) {
    console.error("Auth Error:", userError);
    return { error: "Authentication failed." };
  }

  //  We only query the database for valid UUIDs, ensuring we don't run into errors due to invalid input. The invalid IDs will be handled in the final mapping step.
  const { data, error } = await supabase
    .from("wishlist_items")
    .select("product_id")
    .eq("user_id", user.id)
    .in("product_id", validIds);

  if (error) {
    console.error("Database Error:", error.message);
    return { error: "Failed to check wishlist status." };
  }

  // Mapping the results to a boolean status for each product ID, including handling for invalid IDs
  const wishlistedSet = new Set(data?.map((item) => item.product_id) || []);
  const statusMap: Record<string, boolean> = {};

  // Critical handling: We iterate over the original list of product IDs to ensure we return a status for each one, including those that were invalid. Invalid IDs are automatically marked as not wishlisted (false), while valid IDs are checked against the database results.
  for (const id of productIds) {
    if (invalidIds.includes(id)) {
      // Set status to false for invalid UUIDs without querying the database
      statusMap[id] = false;
    } else {
      // Check if the product ID is in the wishlisted set
      statusMap[id] = wishlistedSet.has(id);
    }
  }
  // This approach ensures that we handle all input gracefully, providing a complete status map for the original list of product IDs while avoiding any database errors caused by invalid UUIDs.
  return { data: statusMap };
}
