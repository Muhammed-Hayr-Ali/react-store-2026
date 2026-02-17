import { createServerClient } from "@/lib/supabase/createServerClient";
import { FullProduct } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

/**
 * @description نقطة نهاية API لجلب بيانات منتج واحد بناءً على الـ slug.
 * @example GET /api/test?slug=sunflower-oil
 */
export async function GET(request: NextRequest) {
  // 1. ✅ استخراج `searchParams` من كائن `request`
  const { searchParams } = new URL(request.url);

  // 2. ✅ الحصول على قيمة 'slug' مباشرة
  const slug = searchParams.get("slug");

  // 3. ✅ التحقق من وجود الـ slug
  if (!slug) {
    return NextResponse.json(
      { error: "Missing 'slug' query parameter." },
      { status: 400 }, // 400 Bad Request
    );
  }

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
    .eq("slug", slug)
    .single();

  const product: FullProduct = data;

  console.log("Product:", product.brand?.name);

  // 5. ✅ معالجة الأخطاء من قاعدة البيانات
  if (error) {
    console.error("Database error:", error);
    // إذا لم يتم العثور على المنتج، أعد 404
    if (error.code === "PGRST116") {
      return NextResponse.json(
        { error: `Product with slug '${slug}' not found.` },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }

  // 6. ✅ إرجاع البيانات بنجاح
  return NextResponse.json(data);
}
