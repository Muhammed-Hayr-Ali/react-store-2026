import { getUserRole } from "@/lib/actions/user"
import { NextRequest, NextResponse } from "next/server"
// import { createServerClient } from "@/lib/supabase/createServerClient"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

   const res = searchParams

   const data = await getUserRole()

  if (!data.success) {
    return NextResponse.json(res, { status: 500 })
  }

  return NextResponse.json(data, { status: 200 })
}
