import { readRolesAndPermissions } from "@/lib/actions/role/read_role_permission"
import {  NextResponse } from "next/server"

// http://localhost:3000/api/role/read_roles_and_permissions
export async function GET() {

  const result = await readRolesAndPermissions()

  if (!result.success) {
    return NextResponse.json(result, { status: 400 })
  }

  return NextResponse.json(result, { status: 200 })
}
