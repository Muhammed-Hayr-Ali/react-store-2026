import { createCategory } from "@/lib/actions/categories/mutations/create"
import { NextResponse } from "next/server"

// http://localhost:3000/api/categories/create

export async function GET() {
  const demoPayload = {
    name: "Demo Category",
    name_ar: "تصنيف تجريبي",
    slug: `demo-category-${Date.now()}`,
    description: "هذا تصنيف تجريبي فقط للتحقق من عمل الدالة",
    parent_id: null,
    is_active: true,
    sort_order: 0,
    image_url: "https://example.com/demo.jpg",
    image_alt: "Demo Category Image",
  }

  const result = await createCategory(demoPayload)

  if (!result.success) {
    return NextResponse.json(result, { status: 400 })
  }

  return NextResponse.json(result, { status: 201 })
}
