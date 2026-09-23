import { createBrand } from "@/lib/actions/brands/mutations/create"
import { NextResponse } from "next/server"

// http://localhost:3000/api/brand/create

  export async function GET() {
  
  const demoPayload = {
    name: "Demo Brand",
    name_ar: "ماركة تجريبية",
    slug: `demo-brand-${Date.now()}`,
    logo_url: "https://example.com/demo.jpg",
    logo_alt: "Demo Brand Image",
  }

  const result = await createBrand(demoPayload)

  if (!result.success) {
    return NextResponse.json(result, { status: 400 })
  }

  return NextResponse.json(result, { status: 201 })
}
