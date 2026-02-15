// lib/actions/products.ts

"use server";

import { revalidatePath } from "next/cache";
import { ProductFormData } from "@/lib/types/product";
import { createServerClient } from "../supabase/createServerClient";

export async function createProduct(
  formData: ProductFormData,
): Promise<{ success: boolean; productId?: string; error?: string }> {
  try {
    const supabase = await createServerClient();

    // إنشاء المنتج الرئيسي
    const { data: productData, error: productError } = await supabase
      .from("products")
      .insert([
        {
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          short_description: formData.short_description,
          main_image_url: formData.main_image_url,
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
      throw productError;
    }

    const productId = productData.id;

    // إنشاء المتغيرات
    for (const variant of formData.variants) {
      const { error: variantError } = await supabase
        .from("product_variants")
        .insert([
          {
            product_id: productId,
            sku: variant.sku,
            price: variant.price,
            discount_price: variant.discount_price,
            discount_expires_at: variant.discount_expires_at
              ? new Date(variant.discount_expires_at).toISOString()
              : null,
            stock_quantity: variant.stock_quantity,
            image_url: variant.image_url,
            is_default: variant.is_default,
          },
        ]);

      if (variantError) {
        // Rollback: حذف المنتج إذا فشل إنشاء المتغيرات
        await supabase.from("products").delete().eq("id", productId);
        throw variantError;
      }
    }

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${productId}`);

    return { success: true, productId };
  } catch (error) {
    console.error("Error creating product:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
