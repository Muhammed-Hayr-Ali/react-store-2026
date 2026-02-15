// lib/products/actions.ts

"use server";

import { createServerClient } from "@/lib/supabase/createServerClient";
import { type FullProduct } from "@/types";

// ====================================================================
// 1. دالة لجلب منتجات العروض الخاصة
// ====================================================================

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

// ✅ لا نحتاج إلى نوع وسيط مع هذا النهج المبسط
// type SpecialOfferQueryResult = { ... };

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

export async function getProductBySlug(
  slug: string,
): Promise<FullProduct | null> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      category:categories (*),
      brand:brands (*),
      variants:product_variants (
        *,
        variant_options:variant_option_values (
          option_value:product_option_values (
            *,
            option:product_options (*)
          )
        )
      ),
      reviews:reviews (*)
    `,
    )
    .eq("slug", slug)
    .single();

  if (error) {
    if (error.code !== "PGRST116") {
      console.error(`Error fetching product by slug "${slug}":`, error);
    }
    return null;
  }

  return {
    ...data,
    category: Array.isArray(data.category) ? data.category[0] : data.category,
    brand: Array.isArray(data.brand) ? data.brand[0] : data.brand,
    variants: data.variants || [],
    reviews: data.reviews || [],
  };
}




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


// lib/actions/products.ts
export async function createProduct(formData: ProductFormData) {
  const supabase = await createServerClient();
  try {
    const { error } = await supabase.rpc("create_full_product", {
      p_name: formData.name,
      p_slug: formData.slug,
      p_description: formData.description,
      p_category_id: formData.category_id,
      p_brand_id: formData.brand_id,
      p_variants: formData.variants, // تمرير JSON مباشرة
    });

    if (error) {
      return { error: error.message };
    }
    return { success: true };
  } catch (e) {
    return { error: "An unexpected error occurred." };
  }
}
