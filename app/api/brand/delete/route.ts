import { deleteBrand } from "@/lib/actions/brands/mutations/dalete"
import { createCategory } from "@/lib/actions/categories/mutations/create"
import { NextRequest, NextResponse } from "next/server"

// http://localhost:3000/api/brand/delete?id=bde3ee07-44fb-4176-afd8-05bc82557114

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  const brandId =
    searchParams.get("id") || "00000000-0000-0000-0000-000000000000"

  const result = await deleteBrand(brandId)

  if (!result.success) {
    return NextResponse.json(result, { status: 400 })
  }

  return NextResponse.json(result, { status: 201 })
}
