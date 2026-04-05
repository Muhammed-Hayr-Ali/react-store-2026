import { NextRequest, NextResponse } from "next/server"
// import { createServerClient } from "@/lib/supabase/createServerClient"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

   const res = searchParams


  if (!res) {
    return NextResponse.json(res, { status: 500 })
  }

  return NextResponse.json(res, { status: 200 })
}
