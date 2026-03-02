// ===============================================================================
// Api Response Type

import { createServerClient } from "../supabase/createServerClient";

// ===============================================================================
export type ApiResponse<T> = {
  data?: T;
  error?: string;
};

export async function getFeaturedProducts(limit: number = 3) {
  // Initialize Supabase client for server-side operations
  const supabase = await createServerClient();

  const { data: products , error } = await supabase
    .from("products")
    .select("*")
    .eq("is_featured", true)
    .limit(limit);

  if (error) {
    console.error("Error fetching products:", error);
    return { error: "Failed to fetch products" };
  }



  return products;
}
