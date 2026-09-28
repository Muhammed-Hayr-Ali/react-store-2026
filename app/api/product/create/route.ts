import { createProduct } from "@/lib/actions/products"
import { NextResponse } from "next/server"

// رابط الاختبار: http://localhost:3000/api/product/create
// ملاحظة: تم استخدام POST بدلاً من GET لأنه المعيار الصحيح والآمن لعمليات الإنشاء.

export async function GET() {
  // بيانات تجريبية شاملة (تتطابق تماماً مع CreateProductCompleteInput)
  const demoPayload = {
    // 1. بيانات المنتج الأساسي
    name: "منتج تجريبي شامل",
    slug: `demo-product-complete-${Date.now()}`,

    // ⚠️ تأكد من أن هذه المعرفات موجودة فعلياً في قاعدة البيانات لتجنب خطأ INVALID_REFERENCE
    brand_id: "0d2501c4-f8da-4a38-a75e-93f43c341ab7",
    category_id: "82f1787d-c90b-4bae-9a7a-07810ed00583",

    description:
      "هذا وصف لمنتج تجريبي شامل يتضمن متغيرات وصور متعددة مرتبطة بها.",
    main_image_url:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80",
    main_image_alt: "صورة منتج تجريبي",
    meta_title: "عنوان منتج تجريبي",
    meta_description: "وصف ميتا لمنتج تجريبي لأغراض تحسين محركات البحث",
    is_active: true,
    is_featured: false,

    // 2. بيانات المتغيرات (مطلوب مصفوفة حسب المخطط الجديد)
    variants: [
      {
        sku: "DEMO-RED-L",
        name: "أحمر - كبير",
        attributes: { color: "red", size: "large" }, // يتطابق مع z.record(z.string(), z.string())
        price: 150.0,
        compare_at_price: 200.0,
        stock_quantity: 50,
        track_inventory: true,
        low_stock_threshold: 10,
        is_active: true,
        sort_order: 1,
      },
      {
        sku: "DEMO-BLUE-M",
        name: "أزرق - متوسط",
        attributes: { color: "blue", size: "medium" },
        price: 140.0,
        compare_at_price: null,
        stock_quantity: 30,
        track_inventory: true,
        low_stock_threshold: 5,
        is_active: true,
        sort_order: 2,
      },
    ],

    // 3. بيانات الصور (مطلوب مصفوفة حسب المخطط الجديد)
    images: [
      {
        url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80",
        alt_text: "صورة الغلاف العامة للمنتج",
        is_primary: true,
        variant_sku: "", // صورة عامة (غير مرتبطة بمتغير محدد)
      },
      {
        url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=500&q=80",
        alt_text: "صورة القميص الأحمر",
        is_primary: false,
        variant_sku: "DEMO-RED-L", // ✅ الربط الذكي: سيتم تحويل هذا الـ SKU إلى variant_id تلقائياً داخل الأكشن
      },
      {
        url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=500&q=80",
        alt_text: "صورة القميص الأزرق",
        is_primary: false,
        variant_sku: "DEMO-BLUE-M", // ✅ الربط الذكي
      },
    ],
  }

  // استدعاء سيرفر أكشن الإنشاء الشامل
  const result = await createProduct(demoPayload)

  // في حالة الفشل (خطأ في التحقق، تكرار الرابط، أو معرفات غير صحيحة)
  if (!result.success) {
    return NextResponse.json(result, { status: 400 })
  }

  // في حالة النجاح
  return NextResponse.json(result, { status: 201 })
}
