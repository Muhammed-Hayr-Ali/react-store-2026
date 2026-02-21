import { getUser } from "@/lib/actions/get-user-action";
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
  // const limit_count = searchParams.get("limit_count");



  
  const supabase = await createServerClient();

  const { data: user, error: userError } = await getUser();

  if (userError || !user) {
    return NextResponse.json(
      { data: null, error: "فشل جلب المستخدم" },
      { status: 500 },
    );
  }

  const { data: cart, error: cartError } = await supabase
    .from("carts")
    .select(
      `
      *,
      cart_items (
        *,
        product_variants (
          *,
          products (
            *
          ),
          variant_option_values (
          *,
            product_option_values (
              *
            )
          )
        )
      )
    `,
    )
    .eq("user_id", user.id)
    .maybeSingle();

















  if (cartError || !cart) {
    console.error("Error fetching cart:", cartError);

    // التصحيح: إرجاع NextResponse مع حالة خطأ 500
    return NextResponse.json(
      { data: null, error: "فشل جلب عربة التسوق" },
      { status: 500 },
    );
  }

  // النجاح: إرجاع البيانات مع حالة 200 (افتراضي)
  return NextResponse.json(cart);
}
