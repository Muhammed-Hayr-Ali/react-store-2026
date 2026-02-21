import { createServerClient } from "../supabase/createServerClient";

export type BestSellingProduct = {
  id: string;
  variant_id: string;
  name: string;
  slug: string;
  main_image_url: string | null;
  price: number;
  discount_price: number | null;
  total_sold: number;
  brand_name?: string;
};

// ================================================================================
// GET BEST SELLING PRODUCTS UTILITY FUNCTION
// ================================================================================
export async function getBestSellingProducts(
  limit: number = 8,
): Promise<{ data: BestSellingProduct[] | null; error?: string }> {
  const supabase = await createServerClient();

  const { data, error } = await supabase.rpc("get_best_selling_products", {
    limit_count: limit,
  });

  if (error) {
    console.error("Error fetching best selling products:", error);
    return { data: null, error: "Failed to fetch best selling products" };
  }

  return { data };
}
