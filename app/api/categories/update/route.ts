// http://localhost:3000/api/categories/update?id=YOUR_CATEGORY_UUID

import { NextRequest, NextResponse } from "next/server"
import { updateCategory } from "@/lib/actions/categories"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const categoryId =
    searchParams.get("id") || "00000000-0000-0000-0000-000000000000"

  const timestamp = Date.now()
  const demoPayload = {
    name: `Updated Category ${timestamp}`,
    name_ar: `تصنيف معدل ${timestamp}`,
    description: "تم تحديث هذا الوصف تلقائياً عبر مسار الفحص السريع",
    sort_order: 5,
  }

  const result = await updateCategory(categoryId, demoPayload)

  if (!result.success) {
    return NextResponse.json(result, { status: 400 })
  }

  return NextResponse.json(result, { status: 200 })
}