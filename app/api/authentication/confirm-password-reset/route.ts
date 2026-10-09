import { confirmPasswordReset } from "@/lib/actions/authentication"
import { NextRequest, NextResponse } from "next/server"

// http://localhost:3000/api/authentication/confirm-password-reset?token=00000000-0000-0000-0000-000000000000

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const token =
    searchParams.get("token") || "00000000-0000-0000-0000-000000000000"
  const password = searchParams.get("password") || "NewSecurePassword123!"

  const result = await confirmPasswordReset({
    token,
    password,
    confirmPassword: password,
  })

  if (!result.success) {
    return NextResponse.json(result, { status: 400 })
  }

  return NextResponse.json(result, { status: 200 })
}