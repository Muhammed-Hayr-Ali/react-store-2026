import { NextRequest, NextResponse } from "next/server"

import { confirmPasswordReset } from "@/lib/actions/authentication/mutations/confirm-password-reset"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const result = await confirmPasswordReset(body)

    if (!result.success) {
      const status =
        result.error === "VALIDATION_ERROR"
          ? 400
          : result.error === "VERIFY_RESET_TOKEN_ERROR"
            ? 400
            : 500

      return NextResponse.json(result, { status })
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "INVALID_REQUEST_BODY",
        details: {
          request: [
            error instanceof Error ? error.message : "Invalid JSON payload",
          ],
        },
      },
      { status: 400 }
    )
  }
}