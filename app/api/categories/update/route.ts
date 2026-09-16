import { updateCategory } from "@/lib/actions/categories/update" // تأكد من مسار الملف
import { NextRequest, NextResponse } from "next/server"

// http://localhost:3000/api/categories/update?id=74627ca6-9467-4020-942a-1295d139836e

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  const categoryId =
    searchParams.get("id") || "00000000-0000-0000-0000-000000000000"

  const demoPayload = {
    name: "Demo Updated Category",
    name_ar: "تصنيف تجريبي محدث",
    // 💡 نستخدم Date.now() لضمان عدم تكرار الـ slug واختبار نجاح التحديث
    slug: `demo-updated-${Date.now()}`,
    description: "هذا تصنيف تجريبي فقط للتحقق من عمل دالة التحديث",
    parent_id: null,
    is_active: true,
    sort_order: 1,
    image_url: "https://example.com/demo-updated.jpg",
    image_alt: "Updated Demo Category Image",
  }

  // استدعاء الدالة
  const result = await updateCategory(categoryId, demoPayload)

  // معالجة الفشل (أخطاء التحقق، الصلاحيات، أو قاعدة البيانات)
  if (!result.success) {
    return NextResponse.json(result, { status: 400 })
  }

  // ✅ 200 OK هو الكود القياسي للنجاح في عمليات التحديث
  return NextResponse.json(result, { status: 200 })
}
