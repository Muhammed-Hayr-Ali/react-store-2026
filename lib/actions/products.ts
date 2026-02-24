"use server";

import { createServerClient } from "@/lib/supabase/createServerClient";
import { cache } from "react";
import { getReviewsByProductId, Review } from "./reviews";
import { checkWishlistStatus } from "./wishlist";

// ===============================================================================
// File Name: product.ts
// Description: product Management Actions .
// Status: Active ✅
// Author: Mohammed Kher Ali
// Date: 2026-02-24
// Version: 1.0
// Copyright (c) 2026 Mohammed Kher Ali
// ===============================================================================

// ================================================================================
// Api Response Type
// ================================================================================
export type ApiResponse<T> = {
  data?: T;
  error?: string;
  [key: string]: unknown;
};

// ===============================================================================
//  Full Product Query
// ===============================================================================
const FULL_PRODUCT_QUERY = `
                            *,
                            brand:brands(*),
                            category:categories(*),
                              variants:product_variants (
                              *,
                                variant_option_values (
                                  product_option_values (
                                  *,
                                    product_options(*)
                                  )
                                )
                              )
                            `;

// ===============================================================================
//  Product With Variant
// ===============================================================================
export type ProductWithVariant = {
  variant_id: string;
  sku: string;
  price: number;
  stock_quantity: number;
  discount_price: number | null;
  discount_expires_at: string | null;
  id: string;
  name: string;
  slug: string;
  main_image_url: string | null;
};

// ===============================================================================
//  Product Detail Response
// ===============================================================================

export type Brand = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  created_at: string;
  description: string | null;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  parent_id: string | null;
  created_at: string;
  description: string | null;
};

export type ProductOption = {
  id: string;
  name: string;
  unit: string;
  description: string;
};

export type ProductOptionValue = {
  id: string;
  value: string;
  option_id: string;
  product_options: ProductOption;
};

export type VariantOptionValue = {
  product_option_values: ProductOptionValue;
};

export type ProductVariant = {
  id: string;
  sku: string;
  price: number;
  image_url: string;
  created_at: string;
  is_default: boolean;
  product_id: string;
  discount_price: number | null;
  stock_quantity: number;
  discount_expires_at: string | null;
  variant_option_values: VariantOptionValue[];
};

export type Author = {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
};

export type SummaryReviews = {
  totalReviews: number;
  averageRating: number;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  main_image_url: string;
  image_urls: string[];
  category_id: string;
  brand_id: string;
  tags: string[]; // Adjust type if tags structure is known
  is_available: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  brand: Brand;
  category: Category;
  variants: ProductVariant[];
};
export type ProductDetailResponse = {
  product: Product;
  reviews: Review[];
  initiallyWishlisted: boolean;
  summaryReviews: SummaryReviews;
};

// ===============================================================================

export async function getSpecialOfferProducts(): Promise<ProductWithVariant[]> {
  const supabase = await createServerClient();

  // ✅ الخطوة 1: العودة إلى الاستعلام المسطح والأكثر موثوقية
  const { data, error } = await supabase
    .from("product_variants")
    .select(
      `
      variant_id: id,
      sku,
      price,
      stock_quantity,
      discount_price,
      discount_expires_at,
      products (
        id,
        name,
        slug,
        main_image_url
      )
    `,
    )
    .not("discount_price", "is", null)
    .not("discount_expires_at", "is", null)
    .gt("discount_expires_at", new Date().toISOString())
    .limit(4);

  if (error) {
    console.error("Error fetching special offer products:", error);
    return [];
  }

  // ✅ الخطوة 2: تبسيط منطق معالجة البيانات
  // هذا الكود يفترض أن `data` يحتوي على كائنات حيث `products` هو كائن وليس مصفوفة
  // وهو ما يجب أن يحدث مع هذا الاستعلام.
  const products = data
    .map((item) => {
      // Supabase قد يعيد العلاقة ككائن أو كمصفوفة. لنتعامل مع كلتا الحالتين.
      const productData = Array.isArray(item.products)
        ? item.products[0]
        : item.products;

      if (!productData) {
        return null;
      }

      return {
        // نسخ خصائص المنتج
        id: productData.id,
        name: productData.name,
        slug: productData.slug,
        main_image_url: productData.main_image_url,
        // نسخ خصائص المتغير
        variant_id: item.variant_id,
        sku: item.sku,
        price: item.price,
        stock_quantity: item.stock_quantity,
        discount_price: item.discount_price,
        discount_expires_at: item.discount_expires_at,
      };
    })
    .filter((p): p is ProductWithVariant => p !== null);

  return products;
}

// ====================================================================
// 2. دالة لجلب منتج واحد بكل تفاصيله باستخدام الـ slug
// ====================================================================

export const getProductBySlug = cache(
  async (
    slug: string,
  ): Promise<ApiResponse<ProductDetailResponse | undefined>> => {
    let reviews: Review[] = [];
    let initiallyWishlisted: boolean = false;

    const supabase = await createServerClient();

    const { data: productResponse, error: productErrorResponse } =
      await supabase
        .from("products")
        .select(FULL_PRODUCT_QUERY)
        .eq("slug", slug)
        .single();

    if (productErrorResponse) {
      console.error("Error fetching product by slug:", productErrorResponse);
      return { error: "Failed to fetch product by slug." };
    }

    const { data: reviewsResponse, error: reviewsErrorResponse } =
      await getReviewsByProductId(productResponse.id);

    if (reviewsErrorResponse) {
      console.error(
        "Error fetching reviews by product ID:",
        reviewsErrorResponse,
      );
      return { error: "Failed to fetch reviews by product ID." };
    }

    reviews = reviewsResponse || [];

    /// Summary Reviews
    const totalReviews = reviews?.length || 0;
    const averageRating =
      totalReviews > 0
        ? reviews!.reduce((acc, review) => acc + review.rating, 0) /
          totalReviews
        : 0;

    const wishlistResponse = await checkWishlistStatus([productResponse.id]);

    if (!wishlistResponse.error && wishlistResponse.data) {
      initiallyWishlisted = wishlistResponse.data[productResponse.id] || false;
    } else {
      console.warn("Failed to check wishlist status:", wishlistResponse.error);
      initiallyWishlisted = false;
    }

    const productDetailResponse: ProductDetailResponse = {
      product: productResponse,
      reviews,
      initiallyWishlisted,
      summaryReviews: {
        totalReviews,
        averageRating,
      },
    };



    return {
     data: productDetailResponse,
    };
  },
);

export interface VariantData {
  price: number;
  stock_quantity: number;
  options: Record<string, string>;
}

export interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  category_id: string;
  brand_id: string;
  variants: VariantData[];
}
