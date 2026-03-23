import { NextRequest, NextResponse } from "next/server"
// import { createServerClient } from "@/lib/supabase/createServerClient"
import { getUserRole } from "@/lib/actions/user/get_user_role"
import { createServerClient } from "@/lib/supabase/createServerClient"

export async function GET(request: NextRequest) {
  // const searchParams = request.nextUrl.searchParams
  // const functionName = searchParams.get("function")
  const supabase = await createServerClient()

   const res = await getUserRole()


  if (!res) {
    return NextResponse.json(res, { status: 500 })
  }

  return NextResponse.json(res, { status: 200 })
}
