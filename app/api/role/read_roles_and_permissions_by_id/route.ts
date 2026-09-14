import { readRolesAndPermissionsById } from "@/lib/actions/role/read_role_permission_id"
import { NextRequest, NextResponse } from "next/server"

// http://localhost:3000/api/role/read_roles_and_permissions_by_id?userId=b07bdbdb-9b33-4fa5-8815-667298234096
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  const userId = searchParams.get("userId")

  const result = await readRolesAndPermissionsById({
    userId,
  })


 if (!result.success) {
   return NextResponse.json(result, { status: 400 })
 }



  return NextResponse.json(result, { status: 200 })
}
