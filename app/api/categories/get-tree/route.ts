// http://localhost:3000/api/categories/get-tree?activeOnly=true

import { NextRequest, NextResponse } from "next/server"
import { getCategoryTree } from "@/lib/actions/categories"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const activeOnly = searchParams.get("activeOnly") !== "false"

  const result = await getCategoryTree({ activeOnly })

  if (!result.success) {
    return NextResponse.json(result, { status: 400 })
  }

  return NextResponse.json(result, { status: 200 })
}