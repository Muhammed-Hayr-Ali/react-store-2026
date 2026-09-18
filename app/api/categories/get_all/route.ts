import { getAllCategories } from "@/lib/actions/categories"
import { NextResponse } from "next/server"

// http://localhost:3000/api/categories/get_all

export async function GET() {
 
  const result = await getAllCategories()

  if (!result.success) {
    return NextResponse.json(result, { status: 400 })
  }

  return NextResponse.json(result, { status: 201 })
}
