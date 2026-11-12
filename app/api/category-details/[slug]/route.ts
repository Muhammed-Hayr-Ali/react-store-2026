/**
 * @file app/api/store/product-details/[slug]/route.ts
 * @description API endpoint to fetch full product details and its approved reviews using product-details queries.
 */

import { NextResponse } from "next/server"
import { getCategoryBySlug } from "@/lib/actions/categories/queries/get-category-by-slug"

interface RouteContext {
  params: Promise<{
    slug: string
  }>
}

export async function GET(context: RouteContext) {
  const { slug } = await context.params

  if (!slug) {
    return NextResponse.json(
      { success: false, error: "slug is required" },
      { status: 400 }
    )
  }

  // 1. جلب تفاصيل المنتج الأساسية مع التصنيف والتصنيف الأب
  const result = await getCategoryBySlug(slug)

  if (!result.success) {
    return NextResponse.json(
      {
        success: false,
        error: result.error,
      },
      { status: 404 }
    )
  }

  return NextResponse.json(result, { status: 200 })
}
