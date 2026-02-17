// lib/actions/products.ts

import { createServerClient } from "@/lib/supabase/createServerClient";
import { FullProduct } from "@/lib/types"; // تأكد من أن المسار صحيح

// ... (باقي دوال المنتجات مثل getProductBySlug)

/**
 * @description يجلب أحدث المنتجات المضافة إلى قاعدة البيانات.
 * @param limit - عدد المنتجات المراد جلبها (افتراضيًا 4).
 * @returns مصفوفة من المنتجات الكاملة (FullProduct).
 */
export async function getNewlyAddedProducts(limit: number = 4) {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      `
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
    `,
    )
    .order("created_at", { ascending: false }) // ✅ الترتيب حسب تاريخ الإنشاء (الأحدث أولاً)
    .limit(limit); // ✅ تحديد عدد النتائج

  // يمكنك إضافة معالجة للبيانات هنا لتحويلها إلى الشكل المسطح إذا أردت
  // const cleanedData = data ? data.map(transformProductData) : [];

  return { data: data as FullProduct[] | null, error: error?.message || null };
}
