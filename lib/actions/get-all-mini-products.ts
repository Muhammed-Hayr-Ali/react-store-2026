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
  is_featured: boolean;
  short_description: string | null;
  main_image_url: string | null;
  category: {
    id: string;
    name: string;
  };
  brand: {
    id: string;
    name: string;
  };
  variants: {
    id: string;
    price: number;
    discount_price: number | null;
    is_default: boolean;
    stock_quantity?: number;
    image_url?: string;
  }[];
  average_rating: number;
  reviews_count: number;
  created_at: string;
};

// ✅ نوع للمنتج بعد المعالجة (الذي سيستخدمه الـ UI)
export type MiniProduct = {
  name: string;
  slug: string;
  short_description: string | null;
  main_image_url: string | null;
  category: string;
  brand: string;
  is_featured: boolean;
  // ✅ بيانات محسوبة من المتغير الافتراضي
  price: number;
  discount_price: number | null;
  discountPercentage: number | null;
  stock_quantity: number;
  variant_id: string;
  average_rating: number;
  total_reviews: number;
};

// ================================================================================
//  Products Query
// ================================================================================

const PRODUCTS_QUERY = `
      *,
      category:categories (id, name),
      brand:brands (id, name),
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
export async function getAllMiniProducts(limit: number = 100): Promise<
  ApiResponse<{
    featuredProducts: MiniProduct[];
    recentProducts: MiniProduct[];
  }>
> {
  // ✅ تحديد نوع الإرجاع بوضوح

  const supabase = await createServerClient();

  // ⚠️ ملاحظة: الفلترة على العلاقات المتداخلة قد لا تعمل في جميع إصدارات Supabase
  // إذا لم تعمل، قم بإزالة .filter() واعتمد على الفلترة داخل الكود (في الأسفل)
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCTS_QUERY)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    console.error("Supabase error:", error?.message);
    return { error: "Error fetching products" }; // ✅ استخدام 'data'
  }

  const processedProducts: MiniProduct[] = data.map((product: ProductRaw) => {
    const defaultVariant = product.variants?.find((v) => v.is_default === true);

    return {
      name: product.name,
      slug: product.slug,
      short_description: product.short_description,
      main_image_url: product.main_image_url,
      category: product.category.name,
      brand: product.brand.name,
      is_featured: product.is_featured,
      price: defaultVariant?.price || 0,
      discount_price: defaultVariant?.discount_price ?? null,
      stock_quantity: defaultVariant?.stock_quantity || 0,
      discountPercentage:
        defaultVariant?.discount_price && defaultVariant?.price
          ? Math.floor(
              ((defaultVariant.price - defaultVariant.discount_price) /
                defaultVariant.price) *
                100,
            )
          : null,

      variant_id: defaultVariant?.id || "",
      // بيانات التقييم
      average_rating: product.average_rating,
      total_reviews: product.reviews_count,
    };
  });

  const featuredProducts: MiniProduct[] = processedProducts.filter(
    (product: MiniProduct) => product.is_featured === true,
  );
  const recentProducts: MiniProduct[] = processedProducts.filter(
    (product: MiniProduct) => product.is_featured === false,
  );

  return {
    data: {
      featuredProducts,
      recentProducts,
    },
    error: null,
  };
}
