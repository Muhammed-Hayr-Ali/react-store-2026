import { createServerClient } from "@/lib/supabase/createServerClient";
import { NextRequest, NextResponse } from "next/server";

export type BestSellingProductm = {
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

export async function GET(request: NextRequest) {
  // const { searchParams } = new URL(request.url);

  // const slug = searchParams.get("slug");
  const supabase = await createServerClient();

  const { data, error } = await supabase.rpc("get_best_selling_products", {
    limit_count: 4,
  });

  if (error) {
    console.error("Error fetching best selling products:", error);
    return { data: null, error: "فشل جلب المنتجات الأكثر مبيعاً" };
  }

  return NextResponse.json(data);
}
