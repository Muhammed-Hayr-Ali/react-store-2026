import { getAllBrand } from "@/lib/actions/brands/queries/get-all"
import { NextResponse } from "next/server"

// http://localhost:3000/api/brand/get_all

  export async function GET() {
  
  const result = await getAllBrand()

  if (!result.success) {
    return NextResponse.json(result, { status: 400 })
  }

  return NextResponse.json(result, { status: 201 })
}
