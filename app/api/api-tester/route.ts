import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/createServerClient"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const functionName = searchParams.get("function")

  const supabase = await createServerClient()
const { data, error } = await supabase.rpc("get_my_complete_data")

  if (error) {
    return NextResponse.json(error, { status: 500 })
  }

  return NextResponse.json(data, { status: 200 })
}
