// http://localhost:3000/api/categories/get-root-categories?limit=8

import { NextRequest, NextResponse } from "next/server"
import { getRootCategories } from "@/lib/actions/categories"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const limitParam = searchParams.get("limit")
  const limit = limitParam ? Number(limitParam) : undefined

  const result = await getRootCategories({ activeOnly: true, limit })

  if (!result.success) {
    return NextResponse.json(result, { status: 400 })
  }

  return NextResponse.json(result, { status: 200 })
}