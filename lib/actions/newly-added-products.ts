"use server";

import { createServerClient } from "../supabase/createServerClient";

//================================================================================
// Types Definition
//================================================================================
export type ApiResponse<T> = {
  data: T | null;
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

//================================================================================
// Server Action
//================================================================================
export async function getNewlyAddedProducts(
  limit: number = 4,
): Promise<ApiResponse<ProcessedProduct[]>> {
  // ✅ تحديد نوع الإرجاع بوضوح

  const supabase = await createServerClient();

  // ⚠️ ملاحظة: الفلترة على العلاقات المتداخلة قد لا تعمل في جميع إصدارات Supabase
  // إذا لم تعمل، قم بإزالة .filter() واعتمد على الفلترة داخل الكود (في الأسفل)
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id,
      name,
      slug,
      short_description,
      main_image_url,
      created_at,
      variants:product_variants (
        price,
        discount_price,
        is_default,
        stock_quantity,
        image_url
      ),
      reviews:reviews (
        rating
      )
    `,
    )
    .order("created_at", { ascending: false })
    // .filter("variants.is_default", "eq", true) // ⚠️ قد تسبب خطأ، يفضل الفلترة يدوياً
    .limit(limit);

  if (error || !data) {
    console.error("Supabase error:", error?.message);
    return { data: null, error: "Error fetching products" }; // ✅ استخدام 'data'
  }

  // ✅ معالجة المصفوفة وتحويل ProductRaw -> ProcessedProduct
  const processedProducts: ProcessedProduct[] = data.map(
    (product: ProductRaw) => {
      // ✅ 1. فلترة المتغير الافتراضي (يدوياً لضمان العمل)
      const defaultVariant = product.variants?.find(
        (v) => v.is_default === true,
      );

      // ✅ 2. حساب التقييمات
      const reviews = product.reviews || [];
      const averageRating =
        reviews.length > 0
          ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
            reviews.length
          : 0;

      // ✅ 3. بناء الكائن النهائي (بدون التعديل على المنتج الأصلي)
      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        short_description: product.short_description,
        main_image_url: product.main_image_url,
        created_at: product.created_at,

        // بيانات المتغير الافتراضي
        price: defaultVariant?.price || 0,
        discount_price: defaultVariant?.discount_price ?? null,
        stock_quantity: defaultVariant?.stock_quantity || 0,
        variant_image: defaultVariant?.image_url || null,

        // نسبة الخصم
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

  // ✅ الإرجاع الصحيح باستخدام خاصية 'data'
  return { data: processedProducts, error: null };
}
