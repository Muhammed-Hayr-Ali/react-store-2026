import { createServerClient } from "../supabase/createServerClient";

// ===============================================================================
// File Name: best_selling_products.ts
// Description: Utility function to fetch best selling products using a Supabase RPC function.
// Status: Active ✅
// Author: Mohammed Kher Ali
// Date: 2026-02-21
// Version: 1.0
// Copyright (c) 2026 Mohammed Kher Ali
// ===============================================================================

// ================================================================================
// Api Response Type
// ================================================================================
export type ApiResponse<T = unknown> = {
  data?: T;
  error?: string;
  [key: string]: unknown;
};

// ================================================================================
// Best Selling Product Type
// ================================================================================
export type BestSellingProduct = {
  variant_id: string;
  product_id: string;
  name: string;
  slug: string;
  main_image_url: string;
  price: number;
  discount_price: number | null;
  total_sold: number;
  brand_name: string;
};

// ================================================================================
// GET BEST SELLING PRODUCTS UTILITY FUNCTION
// ================================================================================
export async function getBestSellingProducts(
  limit: number = 8,
): Promise<ApiResponse<BestSellingProduct[]>> {
  // Initialize Supabase client for server-side operations
  const supabase = await createServerClient();

  // Call the Supabase RPC function to fetch best selling products, passing the limit as a parameter
  const { data, error } = await supabase.rpc("get_best_selling_products", {
    limit_count: limit,
  });

  // Critical error handling: If we fail to fetch best selling products, we log the error and return a user-friendly message
  if (error) {
    console.error("Error fetching best selling products:", error);
    return { error: "Failed to fetch best selling products" };
  }

  // Return the fetched best selling products
  return { data };
}
