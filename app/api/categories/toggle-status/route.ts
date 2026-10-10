// http://localhost:3000/api/categories/toggle-status?id=YOUR_CATEGORY_UUID&active=false

import { NextRequest, NextResponse } from "next/server"
import { toggleCategoryStatus } from "@/lib/actions/categories"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const categoryId =
    searchParams.get("id") || "00000000-0000-0000-0000-000000000000"
  const activeParam = searchParams.get("active")
  const isActive = activeParam === "true" || activeParam === "1"

  const result = await toggleCategoryStatus(categoryId, isActive)

  if (!result.success) {
    return NextResponse.json(result, { status: 400 })
  }

  return NextResponse.json(result, { status: 200 })
}