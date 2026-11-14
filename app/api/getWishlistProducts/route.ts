import { getWishlistProducts } from "@/lib/actions/wishlists/queries/get-wishlist-products"
import { NextResponse } from "next/server"

// 1. GET: لجلب جميع التقييمات مع بيانات العميل والمنتج المرتبط
export async function GET() {
  try {
    const result = await getWishlistProducts()

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: true, data: result.data },
      { status: 200 }
    )
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Unexpected error occurred"
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}
