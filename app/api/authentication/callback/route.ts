import { handleCallback } from "@/lib/actions/authentication"
import { NextRequest, NextResponse } from "next/server"

// http://localhost:3000/api/authentication/callback?code=demo-auth-code

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code") || "demo-auth-code"

  const result = await handleCallback({ code })

  if (!result.success) {
    return NextResponse.json(result, { status: 400 })
  }

  return NextResponse.json(result, { status: 200 })
}