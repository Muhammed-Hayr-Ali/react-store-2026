import { getBrandBySlug } from "@/lib/actions/brands/queries/get_by_slug"
import { NextRequest, NextResponse } from "next/server"

// http://localhost:3000/api/brand/get_by_slug?slug=almarai

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  const slug =
    searchParams.get("slug") || "slug-name"

  const result = await getBrandBySlug(slug)

  if (!result.success) {
    return NextResponse.json(result, { status: 400 })
  }

  return NextResponse.json(result, { status: 201 })
}
