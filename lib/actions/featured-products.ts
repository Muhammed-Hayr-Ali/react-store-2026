import { createServerClient } from "../supabase/createServerClient";




// ===============================================================================
// Api Response Type
// ===============================================================================
export type ApiResponse<T> = {
  data?: T;
  error?: string;
};


// ===============================================================================
// Products type
// ===============================================================================

export type Product = {
  name: string;
  slug: string;
  short_description: string;
  main_image_url: string;
  image_urls: string[];
  category_id: string;
  brand_id: string;

};

// ===============================================================================
// Get Featured Products Function
// ===============================================================================

export async function getFeaturedProducts(limit: number = 3): Promise<ApiResponse<Product[]>> {
  // Initialize Supabase client for server-side operations
  const supabase = await createServerClient();

  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_featured", true)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching products:", error);
    return { error: "Failed to fetch products" };
  }



  return { data: products };
}
