// http://localhost:3000/api/categories/delete-batch?ids=UUID_1,UUID_2

import { NextRequest, NextResponse } from "next/server"
import { deleteBatchCategories } from "@/lib/actions/categories"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const idsParam = searchParams.get("ids")

  const ids = idsParam
    ? idsParam.split(",").map((s) => s.trim())
    : ["00000000-0000-0000-0000-000000000000"]

  const result = await deleteBatchCategories({ ids })

  if (!result.success) {
    return NextResponse.json(result, { status: 400 })
  }

  return NextResponse.json(result, { status: 200 })
}