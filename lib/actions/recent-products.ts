"use server";

import { createServerClient } from "../supabase/createServerClient";

//================================================================================
// Types Definition
//================================================================================
export type ApiResponse<T> = {
  data?: T;
  error: string | null;
};

// ✅ نوع للمنتج كما يأتي من قاعدة البيانات (قبل المعالجة)
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

// ================================================================================
//  Products Query
// ================================================================================

const PRODUCTS_QUERY = `
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
    `;

//================================================================================
// Server Action
//================================================================================
export async function getRecentProducts(
  limit: number = 4,
): Promise<ApiResponse<ProcessedProduct[]>> {
  // ✅ تحديد نوع الإرجاع بوضوح

  const supabase = await createServerClient();

  // ⚠️ ملاحظة: الفلترة على العلاقات المتداخلة قد لا تعمل في جميع إصدارات Supabase
  // إذا لم تعمل، قم بإزالة .filter() واعتمد على الفلترة داخل الكود (في الأسفل)
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCTS_QUERY)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    console.error("Supabase error:", error?.message);
    return { error: "Error fetching products" }; // ✅ استخدام 'data'
  }

  const processedProducts: ProcessedProduct[] = data.map(
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


  return { data: processedProducts, error: null };
}








