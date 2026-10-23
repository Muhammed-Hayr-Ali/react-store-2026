/**
 * @file app/api/store/product-details/[slug]/route.ts
 * @description API endpoint to fetch full product details and its approved reviews using product-details queries.
 */

import { NextResponse } from "next/server"
import { getProductDetails } from "@/lib/actions/store/product-details/details/queries/get-product-details"
import { getProductReviews } from "@/lib/actions/store/product-details/reviews/queries/get-product-reviews"


interface RouteContext {
  params: Promise<{
    slug: string
  }>
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { slug } = await context.params

    if (!slug) {
      return NextResponse.json(
        { success: false, error: "Product slug is required" },
        { status: 400 }
      )
    }

    // 1. جلب تفاصيل المنتج الأساسية مع التصنيف والتصنيف الأب
    const productResult = await getProductDetails(slug)

    if (!productResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: productResult.error,
          details: productResult.details,
        },
        { status: 404 }
      )
    }

    const product = productResult.data

    // 2. جلب التعليقات المعتمدة الخاصة بالمنتج باستخدام الـ id الخاص به
    const reviewsResult = await getProductReviews(product.id, { limit: 10 })
    const reviews = reviewsResult.success ? reviewsResult.data : []

    // 3. إرجاع النتيجة الكاملة مجتمعة
    return NextResponse.json(
      {
        success: true,
        data: {
          product,
          reviews,
        },
      },
      { status: 200 }
    )
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Unexpected error occurred"

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}
