// http://localhost:3000/api/categories/get-selector?activeOnly=true

import { NextRequest, NextResponse } from "next/server"
import { getCategoriesSelector } from "@/lib/actions/categories"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const activeOnly = searchParams.get("activeOnly") !== "false"

  const result = await getCategoriesSelector({ activeOnly })

  if (!result.success) {
    return NextResponse.json(result, { status: 400 })
  }

  return NextResponse.json(result, { status: 200 })
}