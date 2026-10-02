import { NextRequest, NextResponse } from "next/server"
import { getFeaturedProductSlides } from "@/lib/actions/products/queries/get-featured-slides"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limitParam = searchParams.get("limit")

    // تحويل قيمة limit والتأكد من أنها رقم صالح
    const limit = limitParam ? parseInt(limitParam, 10) : 5
    const safeLimit = isNaN(limit) || limit <= 0 ? 5 : limit

    const result = await getFeaturedProductSlides({ limit: safeLimit })

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          details: result.details,
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        count: result.data?.length ?? 0,
        data: result.data,
      },
      { status: 200 }
    )
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error"

    return NextResponse.json(
      {
        success: false,
        error: "INTERNAL_SERVER_ERROR",
        details: message,
      },
      { status: 500 }
    )
  }
}
