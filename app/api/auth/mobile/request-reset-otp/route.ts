import { NextRequest, NextResponse } from "next/server"

import { requestMobilePasswordResetOtp } from "@/lib/actions/authentication/mutations/request-mobile-password-reset-otp"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const result = await requestMobilePasswordResetOtp(body)

    if (!result.success) {
      const status =
        result.error === "VALIDATION_ERROR"
          ? 400
          : result.error === "OTP_RATE_LIMIT_EXCEEDED"
            ? 429
            : 500

      return NextResponse.json(result, { status })
    }

    return NextResponse.json(result, { status: 200 })
  } catch {
    return NextResponse.json(
      { success: false, error: "INVALID_REQUEST_BODY" },
      { status: 400 }
    )
  }
}