// http://localhost:3000/api/categories/get-by-slug?slug=beverages

import { NextRequest, NextResponse } from "next/server"
import { getCategoryBySlug } from "@/lib/actions/categories"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const slug = searchParams.get("slug") || "demo-slug"

  const result = await getCategoryBySlug(slug)

  if (!result.success) {
    return NextResponse.json(result, { status: 400 })
  }

  return NextResponse.json(result, { status: 200 })
}