import { requestPasswordReset } from "@/lib/actions/authentication"
import { NextRequest, NextResponse } from "next/server"

// http://localhost:3000/api/authentication/request-password-reset?email=test@example.com

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const email = searchParams.get("email") || "test@example.com"

  const result = await requestPasswordReset({ email })

  if (!result.success) {
    return NextResponse.json(result, { status: 400 })
  }

  return NextResponse.json(result, { status: 200 })
}