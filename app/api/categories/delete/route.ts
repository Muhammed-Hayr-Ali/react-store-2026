// http://localhost:3000/api/categories/delete?id=YOUR_CATEGORY_UUID

import { NextRequest, NextResponse } from "next/server"
import { deleteCategory } from "@/lib/actions/categories"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const categoryId =
    searchParams.get("id") || "00000000-0000-0000-0000-000000000000"

  const result = await deleteCategory(categoryId)

  if (!result.success) {
    return NextResponse.json(result, { status: 400 })
  }

  return NextResponse.json(result, { status: 200 })
}