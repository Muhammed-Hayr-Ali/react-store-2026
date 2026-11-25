import { getAllCategories } from "@/lib/actions/store/queries/get-all-categories"
import { NextRequest, NextResponse } from "next/server"
 
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const rawLimit = searchParams.get("limit")
  const parsedLimit = rawLimit ? Number.parseInt(rawLimit, 10) : 0
  const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 0

  const result = await getAllCategories({ limit })

  if (!result.success) {
    return NextResponse.json(
      {
        ok: false,
        error: result.error,
        details: result.details,
      },
      { status: 500 }
    )
  }

  return NextResponse.json(
    {
      ok: true,
      count: result.data.length,
      data: result.data,
    },
    { status: 200 }
  )
}