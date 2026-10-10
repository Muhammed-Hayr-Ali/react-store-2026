// http://localhost:3000/api/categories/get-all?page=1&limit=10&search=food

import { NextRequest, NextResponse } from "next/server"
import { getAllCategories } from "@/lib/actions/categories"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const page = Number(searchParams.get("page") || 1)
  const limit = Number(searchParams.get("limit") || 20)
  const search = searchParams.get("search") || undefined
  const activeParam = searchParams.get("active")
  const isActive =
    activeParam === "true"
      ? true
      : activeParam === "false"
      ? false
      : undefined

  const result = await getAllCategories({
    page,
    limit,
    search,
    is_active: isActive,
  })

  if (!result.success) {
    return NextResponse.json(result, { status: 400 })
  }

  return NextResponse.json(result, { status: 200 })
}