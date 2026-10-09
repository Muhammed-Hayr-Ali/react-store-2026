import { signInWithGoogle } from "@/lib/actions/authentication"
import { NextResponse } from "next/server"

// http://localhost:3000/api/authentication/sign-in-google

export async function GET() {
  const result = await signInWithGoogle()

  if (!result.success) {
    return NextResponse.json(result, { status: 400 })
  }

  return NextResponse.json(result, { status: 200 })
}