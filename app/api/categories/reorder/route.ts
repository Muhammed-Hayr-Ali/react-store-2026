// http://localhost:3000/api/categories/reorder?id=UUID_1&order=10

import { NextRequest, NextResponse } from "next/server"
import { reorderCategories } from "@/lib/actions/categories"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const categoryId =
    searchParams.get("id") || "00000000-0000-0000-0000-000000000000"
  const sortOrder = Number(searchParams.get("order") || 1)

  const demoPayload = {
    items: [{ id: categoryId, sort_order: sortOrder }],
  }

  const result = await reorderCategories(demoPayload)

  if (!result.success) {
    return NextResponse.json(result, { status: 400 })
  }

  return NextResponse.json(result, { status: 200 })
}