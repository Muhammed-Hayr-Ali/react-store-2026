import { hasPermission } from "@/lib/actions/role/permission-checker"
import { NextRequest, NextResponse } from "next/server"

// http://localhost:3000/api/role/has_permission?permission=upload_product
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  const permission = searchParams.get("permission") || ""

  const result = await hasPermission(permission)

  return NextResponse.json(result, { status: 200 })
}
