// lib/actions/products.ts

"use server";
import { ProductFormData } from "../types/product";
import { createServerClient } from "../supabase/createServerClient";
import { isAdmin } from "./get-user-action";

// ===============================================================================
// File Name: products-manager.ts
// Description: Product Management Actions.
// Status: Active ✅
// Author: Mohammed Kher Ali
// Date: 2026-02-21
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


 interface ProductOption {
  id: string;
  name: string;
  description?: string | null;
  unit?: string | null;
}

// يمثل قيمة الخيار مثل "أحمر" أو "XL"
 interface ProductOptionValue {
  id: string;
  value: string;
  product_options: ProductOption; // علاقة
}

// يمثل سجل الربط في جدول variant_option_values
 interface VariantOptionValueLink {
  option_value: ProductOptionValue;
}

// يمثل متغير المنتج (Variant) كما يأتي من Supabase
 interface ProductVariantFromSupabase {
  id: string;
  sku: string;
  price: number;
  image_url: string;
  created_at: string;
  is_default: boolean;
  product_id: string;
  discount_price: number | undefined;
  stock_quantity: number;
  discount_expires_at: string | null;
  variant_option_values: VariantOptionValueLink[];
}

// يمثل المنتج الكامل كما يأتي من Supabase
 interface ProductFromSupabase {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string | undefined;
  main_image_url: string | undefined;
  image_urls: string[] | null;
  category_id: string | null;
  brand_id: string | null;
  tags: string[] | null;
  is_available: boolean;
  is_featured: boolean;
  // هذه هي العلاقة التي قمنا بجلبها
  product_variants: ProductVariantFromSupabase[];
}










// ===============================================================================
// Create Product (Transaction-based)
// ===============================================================================
export async function createProduct(
  formData: ProductFormData,
): Promise<{ success: boolean; productId?: string; error?: string }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "User not authenticated" };
    if (!(await isAdmin())) return { success: false, error: "Unauthorized" };

    // استدعاء دالة PostgreSQL كمعاملة
    const { data: newProductId, error } = await supabase.rpc(
      "create_full_product",
      { product_data: formData } // مرر البيانات ككائن JSON
    );

    if (error) {
      // إذا حدث أي خطأ داخل الدالة، سيتم إرجاعه هنا
      console.error("RPC create_full_product error:", error);
      throw error;
    }

    return { success: true, productId: newProductId };
  } catch (error: unknown) {
    return { success: false, error: ( error as Error)?.message  || "Failed to create product" };
  }
}

// ===============================================================================
// Update Product (Transaction-based)
// ===============================================================================
export async function updateProduct(
  productId: string,
  formData: ProductFormData,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "User not authenticated" };
    if (!(await isAdmin())) return { success: false, error: "Unauthorized" };

    // استدعاء دالة PostgreSQL كمعاملة
    const { error } = await supabase.rpc("update_full_product", {
      p_id: productId,       // المعامل الأول
      product_data: formData, // المعامل الثاني
    });

    if (error) {
      // إذا حدث أي خطأ، سيتم إرجاعه هنا
      console.error("RPC update_full_product error:", error);
      throw error;
    }

    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: ( error as Error)?.message || "Failed to update product" };
  }
}








// ===============================================================================
// Get Product By ID
// ===============================================================================
export async function getProductById(
  productId: string,
): Promise<ApiResponse<ProductFormData>> {
  if (!productId) {
    return { error: "Product ID is required." };
  }

  const supabase = await createServerClient();

  try {
    // بناء الاستعلام لجلب المنتج وكل بياناته المرتبطة
    const { data: productData, error } = await supabase
      .from("products")
      .select(
        `
        *,
        product_variants (
          *,
          variant_option_values (
            option_value:product_option_values (
              *,
              product_options (*)
            )
          )
        )
      `,
      )
      .eq("id", productId)
      .single<ProductFromSupabase>(); // <-- استخدم النوع هنا

    if (error) {
      // إذا لم يتم العثور على المنتج، Supabase تعيد خطأ
      console.error("Supabase fetch error:", error.message);
      return { error: "Product not found or failed to fetch data." };
    }

    if (!productData) {
      return { error: "Product not found." };
    }

    // الآن، نحتاج إلى تحويل البيانات المستلمة من Supabase إلى هيكل ProductFormData
    // الذي يفهمه النموذج الخاص بك.
    const formattedProduct: ProductFormData = {
      id: productData.id,
      name: productData.name,
      slug: productData.slug,
      description: productData.description || "",
      short_description: productData.short_description,
      main_image_url: productData.main_image_url,
      image_urls: productData.image_urls || [],
      category_id: productData.category_id,
      brand_id: productData.brand_id,
      tags: productData.tags || [],
      is_available: productData.is_available,
      is_featured: productData.is_featured,
      variants: productData.product_variants.map(
        (variant: ProductVariantFromSupabase) => ({
          id: variant.id,
          sku: variant.sku,
          price: variant.price,
          discount_price: variant.discount_price ?? undefined,
          discount_expires_at: variant.discount_expires_at ?? undefined,
          stock_quantity: variant.stock_quantity,
          image_url: variant.image_url,
          is_default: variant.is_default,
          // تحويل الخيارات إلى الهيكل المطلوب
          variant_options: variant.variant_option_values.map((vov) => ({
            // هذا هو الهيكل المعقد الذي يتوقعه النموذج
            option_value: {
              id: vov.option_value.id,
              value: vov.option_value.value,
              product_options: {
                id: vov.option_value.product_options.id,
                name: vov.option_value.product_options.name,
              },
            },
          })),
        }),
      ),
    };

    return { data: formattedProduct };
  } catch {
    console.error("Unexpected error in getProductById:",);
    return { error: "An unexpected error occurred." };
  }
}














export async function deleteProduct(id: string): Promise<ApiResponse<boolean>> {
  // Initialize Supabase client for server-side operations
  const supabase = await createServerClient();
  // Delete the ProductOption for the provided ID
  const { error } = await supabase.from("products").delete().eq("id", id);
  // Critical error handling: If we fail to delete the ProductOption, we log the error and return a user-friendly message
  if (error) {
    console.error("Error deleting ProductOption:", error);
    return { error: "Failed to delete ProductOption." };
  }
  // Return the success status
  return { data: true };
}
