import { hasRole } from "@/lib/actions/role/role-checker"
import { NextRequest, NextResponse } from "next/server"

// http://localhost:3000/api/role/role-checker?role=admin
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  const role = searchParams.get("role") || ""

  const result = await hasRole(role)

  return NextResponse.json(result, { status: 200 })
}
