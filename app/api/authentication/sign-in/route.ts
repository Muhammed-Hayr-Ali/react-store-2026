import { signInWithPassword } from "@/lib/actions/authentication"
import { NextRequest, NextResponse } from "next/server"

// http://localhost:3000/api/authentication/sign-in

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const email = searchParams.get("email") || "demo-user@example.com"
  const password = searchParams.get("password") || "Password123!"

  const result = await signInWithPassword({ email, password })

  if (!result.success) {
    return NextResponse.json(result, { status: 400 })
  }

  return NextResponse.json(result, { status: 200 })
}