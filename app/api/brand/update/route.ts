import { updateBrand } from "@/lib/actions/brands/mutations/update"
import { NextRequest, NextResponse } from "next/server"

// http://localhost:3000/api/brand/update?id=bde3ee07-44fb-4176-afd8-05bc82557114

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  const brandId =
    searchParams.get("id") || "00000000-0000-0000-0000-000000000000"

  const demoPayload = {
    name: "Demo Brand Updated",
    name_ar: "ماركة تجريبية محدثة",
    slug: `demo-brand-updated-${Date.now()}`,
    logo_url: "https://example.com/demo.jpg",
    logo_alt: "Demo Brand Image",
  }

  const result = await updateBrand(brandId, demoPayload)

  if (!result.success) {
    return NextResponse.json(result, { status: 400 })
  }

  return NextResponse.json(result, { status: 201 })
}
