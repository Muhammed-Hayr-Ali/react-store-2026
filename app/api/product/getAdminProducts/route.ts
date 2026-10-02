import { NextResponse } from "next/server"
import { getAdminProductsList } from "@/lib/actions/products/queries/get-admin-products"


export async function GET() {
  try {
    const result = await getAdminProductsList()

    // التحقق المباشر من الفشل ليقوم TypeScript بعمل Narrowing صحيح
    if (!result.success ) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          details: result.details ?? {
            message: "Failed to fetch admin products list",
          },
        },
        { status: 500 }
      )
    }

    if (!result.data) {
      return NextResponse.json(
        {
          success: true,
          count: 0,
          data: [],
        },
        { status: 200 }
      )
    }

    // هنا يدرك TypeScript تلقائياً أن result هي SuccessResult وتملك data
    return NextResponse.json(
      {
        success: true,
        count: result.data.length,
        data: result.data,
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "INTERNAL_SERVER_ERROR",
        details: {
          message: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    )
  }
}
