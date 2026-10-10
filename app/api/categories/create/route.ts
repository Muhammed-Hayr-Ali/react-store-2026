// http://localhost:3000/api/categories/create

import { NextResponse } from "next/server"
import { createCategory } from "@/lib/actions/categories"

export async function GET() {
  const timestamp = Date.now()
  const demoPayload = {
    name: `Category Test ${timestamp}`,
    name_ar: `تصنيف اختباري ${timestamp}`,
    slug: `category-test-${timestamp}`,
    description: "تصنيف تجريبي لفحص دالة الإضافة والتحقق من سير العمليات",
    parent_id: null,
    is_active: true,
    sort_order: 1,
    image_url: "https://images.unsplash.com/photo-1542838132-92c53300491e",
    image_alt: "Category Test Image Alt",
  }

  const result = await createCategory(demoPayload)

  if (!result.success) {
    return NextResponse.json(result, { status: 400 })
  }

  return NextResponse.json(result, { status: 201 })
}