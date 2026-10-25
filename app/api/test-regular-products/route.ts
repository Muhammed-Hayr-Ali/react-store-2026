/**
 * @file app/api/test-regular-products/route.ts
 * @description Test API endpoint to verify getLatestRegularProducts execution and inspect results.
 */

import { NextResponse } from "next/server"
import { getLatestRegularProducts } from "@/lib/actions/store/queries/get-latest-regular-products"

export async function GET() {
  try {
    // جلب أحدث 5 منتجات عادية (غير مميزة) للتجربة
    const result = await getLatestRegularProducts({ limit: 20 })

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          details: result.details,
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      count: result.data.length,
      products: result.data,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      {
        success: false,
        error: "UNEXPECTED_SERVER_ERROR",
        message: errorMessage,
      },
      { status: 500 }
    )
  }
}