import { NextResponse } from "next/server"
import { getProductCompleteBySlug } from "@/lib/actions/products/queries/get-complete-by-slug"
import { getReviewSummary, getProductReviewsList } from "@/lib/actions/reviews"

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  // 1. استخراج الـ slug بطريقة Next.js 15
  const { slug } = await context.params

  // 2. التحقق من صحة وقيمة الـ slug
  if (!slug || slug === "undefined" || slug === "null") {
    return NextResponse.json(
      {
        success: false,
        error: "INVALID_SLUG_PROVIDED",
        details: { message: "Product slug is invalid or missing" },
      },
      { status: 400 }
    )
  }

  // 3. جلب بيانات المنتج أولاً عن طريق الـ slug
  const productResult = await getProductCompleteBySlug(slug)

  if (!productResult.success || !productResult.data) {
    return NextResponse.json(
      {
        success: false,
        error: "PRODUCT_NOT_FOUND",
        details: { message: "Product not found" },
      },
      { status: 404 }
    )
  }

  const productId = productResult.data.id

  // 4. جلب التقييمات والملخص بالتوازي باستخدام معرف المنتج id المستخرج
  const [summaryResult, reviewsResult] = await Promise.all([
    getReviewSummary(productId),
    getProductReviewsList(productId),
  ])

  // 5. إرجاع النتائج الكاملة
  return NextResponse.json(
    {
      message: "Debug Data",
      productSlug: slug,
      productId: productId,
      product: productResult,
      reviewSummary: summaryResult,
      reviewsList: reviewsResult,
    },
    { status: 200 }
  )
}
