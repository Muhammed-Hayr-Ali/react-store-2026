// http://localhost:3000/api/categories/get-by-id?id=YOUR_CATEGORY_UUID

import { NextRequest, NextResponse } from "next/server"
import { getCategoryById } from "@/lib/actions/categories"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const id = searchParams.get("id") || "00000000-0000-0000-0000-000000000000"

  const result = await getCategoryById(id)

  if (!result.success) {
    return NextResponse.json(result, { status: 400 })
  }

  return NextResponse.json(result, { status: 200 })
}