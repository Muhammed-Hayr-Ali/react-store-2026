// lib/actions/products.ts

"use server";
import { ProductFormData } from "../types/product";
import { createServerClient } from "../supabase/createServerClient";
import { isAdmin } from "./get-user-action";

export async function createProduct(
  formData: ProductFormData
): Promise<{ success: boolean; productId?: string; error?: string }> {
  try {
    const supabase = await createServerClient();
    const {  data:{ user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }
    
  
  
  
    const data = await isAdmin();
   
   
    if (!data) {
      return { success: false, error: "Unauthorized: Admins only" };
    }

    // ============================================
    // إنشاء المنتج الرئيسي
    // ============================================
    const { data: productData, error: productError } = await supabase
      .from("products")
      .insert([
        {
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          short_description: formData.short_description ?? null,
          main_image_url: formData.main_image_url ?? null,
          image_urls: formData.image_urls ?? [],
          category_id: formData.category_id,
          brand_id: formData.brand_id,
          tags: formData.tags ?? [],
          is_available: formData.is_available,
          is_featured: formData.is_featured,
        },
      ])
      .select("id")
      .single();

    if (productError) {
      console.error("Product creation error:", productError);
      return { success: false, error: productError.message };
    }

    const productId = productData.id;

    // ============================================
    // إنشاء المتغيرات وربط الخيارات
    // ============================================
    for (const variant of formData.variants) {
      // إنشاء المتغير
      const { data:  variantData, error: variantError } = await supabase
        .from("product_variants")
        .insert([
          {
            product_id: productId,
            sku: variant.sku,
            price: variant.price,
            discount_price: variant.discount_price ?? null,
            discount_expires_at: variant.discount_expires_at 
              ? new Date(variant.discount_expires_at).toISOString() 
              : null,
            stock_quantity: variant.stock_quantity,
            image_url: variant.image_url ?? null,
            is_default: variant.is_default,
          },
        ])
        .select("id")
        .single();

      if (variantError) {
        await supabase.from("products").delete().eq("id", productId);
        console.error("Variant creation error:", variantError);
        return { success: false, error: variantError.message };
      }

      const variantId = variantData.id;

      // ربط خيارات المتغير (إذا وجدت)
      if (variant.variant_options && variant.variant_options.length > 0) {
        for (const option of variant.variant_options) {
          const { error: linkError } = await supabase
            .from("variant_option_values")
            .insert([
              {
                variant_id: variantId,
                option_value_id: option.option_value.id,
              },
            ]);

          if (linkError) {
            console.error("Option link error:", linkError);
          }
        }
      }
    }


    
    return { success: true, productId };
  } catch (error) {
    console.error("Unexpected error creating product:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}