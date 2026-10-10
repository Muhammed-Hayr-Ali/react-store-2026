// http://localhost:3000/api/categories/get-summary

import { NextResponse } from "next/server"
import { getCategoriesSummary } from "@/lib/actions/categories"

export async function GET() {
  const result = await getCategoriesSummary()

  if (!result.success) {
    return NextResponse.json(result, { status: 400 })
  }

  return NextResponse.json(result, { status: 200 })
}