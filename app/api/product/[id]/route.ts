import { getProductCompleteById } from "@/lib/actions/products/queries/get-complete-by-id"
import { getReviewSummary, getProductReviewsList } from "@/lib/actions/reviews"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  // ✅ الطريقة الصحيحة في Next.js 15 لاستخراج المعرفات
  const { id } = await context.params

  // ✅ حماية إضافية
  if (!id || id === "undefined" || id === "null") {
    return NextResponse.json(
      {
        success: false,
        error: "INVALID_ID_PROVIDED",
        details: { message: "معرف المنتج غير صالح أو مفقود" },
      },
      { status: 400 }
    )
  }

  // ✅ جلب البيانات الثلاثة معاً لنرى الصورة الكاملة
  const [productResult, summaryResult, reviewsResult] = await Promise.all([
    getProductCompleteById(id),
    getReviewSummary(id),
    getProductReviewsList(id),
  ])

  // ✅ إرجاع كل شيء في كائن JSON واحد واضح
  return NextResponse.json(
    {
      message: "Debug Data",
      productId: id,
      product: productResult,
      reviewSummary: summaryResult,
      reviewsList: reviewsResult, // <-- هنا سنرى بالضبط لماذا المصفوفة فارغة
    },
    { status: 200 }
  )
}
