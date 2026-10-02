import { NextResponse } from "next/server"
import { getLatestProducts } from "@/lib/actions/products/queries/get-latest-products"

// http://localhost:3000/api/test-latest-products

export async function GET() {
  const result = await getLatestProducts({ limit: 10, activeOnly: true })

  if (!result.success) {
    return NextResponse.json(result, { status: 400 })
  }

  return NextResponse.json(result, { status: 200 })
}
