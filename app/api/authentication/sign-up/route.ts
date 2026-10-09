import { signUpWithPassword } from "@/lib/actions/authentication"
import { NextResponse } from "next/server"

// http://localhost:3000/api/authentication/sign-up

export async function GET() {
  const uniqueSuffix = Date.now()
  const demoPayload = {
    name: `User ${uniqueSuffix}`,
    email: `user-${uniqueSuffix}@example.com`,
    password: "Password123!",
  }

  const result = await signUpWithPassword(demoPayload)

  if (!result.success) {
    return NextResponse.json(result, { status: 400 })
  }

  return NextResponse.json(result, { status: 201 })
}