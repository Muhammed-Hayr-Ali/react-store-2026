import { createServerClient } from "@/lib/supabase/createServerClient";
import { NextRequest, NextResponse } from "next/server";

export type Product = {
  name: string;
  slug: string;
  short_description: string;
  main_image_url: string;
  variants: {
    price: number;
    is_default: boolean;
    discount_price: number | null;
  }[];
  reviews: {
    rating: number;
  }[];



  price: number;
  discount_price: number | null;
  discountPercentage: number | null;
  average_rating?: number;
  total_reviews?: number;
};



export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const slug = searchParams.get("slug");
  const limit = searchParams.get("limit") as number | null;

  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      `
    name,
    slug,
    short_description,
    main_image_url,
    variants:product_variants (
      price,
      discount_price,
      is_default
    ),
    reviews:reviews (
      rating
    )
  `,
    )
    .eq("slug", slug)
    // ✅ فلترة المتغيرات الافتراضية فقط
    .filter("variants.is_default", "eq", true)
    // .limit(limit || 4);
    .single();

  if (error || !data) {
    console.error("Supabase error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // calculate price and discount_price for the default variant

  const defaultVariant = data.variants.find((variant) => variant.is_default);
  const reviews = data.reviews || [];

  //  calculate price and discount_price and discountPercentage for the default variant
  if (defaultVariant) {
    (data as Product).price = defaultVariant.price || 0;
    (data as Product).discount_price = defaultVariant.discount_price ?? null;
    // calculate discount percentage
    (data as Product).discountPercentage = defaultVariant.discount_price
      ? Math.floor(
          ((defaultVariant.price - defaultVariant.discount_price) /
            defaultVariant.price) *
            100,
        )
      : null;

  }

  // // calculate average rating for each product
  // if (data) {
  //   const totalRatings = data.reviews.reduce(
  //     (sum: number, review: { rating: number }) => sum + review.rating,
  //     0,
  //   );

  //   // Calculate average rating
  //   const averageRating =
  //     data.reviews.length > 0 ? totalRatings / data.reviews.length : 0;
  //   // Total reviews
  //   const totalReviews = data.reviews.length;
  //   // Add average rating and total reviews to the product data

  //   (data as Product).average_rating = averageRating;
  //   (data as Product).total_reviews = totalReviews;
  // }

  // if (error) {
  //   console.error("Supabase error:", error.message);
  //   return NextResponse.json({ error: error.message }, { status: 500 });
  // }

  return NextResponse.json(data);
}
