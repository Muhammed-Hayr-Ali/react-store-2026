import readMyProfile from "@/lib/actions/profile/read_my_profile"
import { NextResponse } from "next/server"


// http://localhost:3000/api/profile/read_my_profile

export async function GET() {
  // const searchParams = request.nextUrl.searchParams

  const result = await readMyProfile()

  if (!result.success) {
    return NextResponse.json(result, { status: 400 })
  }

  return NextResponse.json(result, { status: 200 })
}
