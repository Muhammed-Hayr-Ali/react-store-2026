import { NextRequest, NextResponse } from "next/server"

import {
  getMobileProfile,
  updateMobileProfile,
} from "@/lib/actions/profile/mobile-profile"

function extractBearerToken(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization")
  if (!authHeader) return null

  const [scheme, token] = authHeader.trim().split(/\s+/)
  if (!scheme || !token || scheme.toLowerCase() !== "bearer") {
    return null
  }

  return token
}

function mapProfileErrorStatus(error?: string): number {
  switch (error) {
    case "VALIDATION_ERROR":
      return 400
    case "UNAUTHORIZED":
      return 401
    case "PROFILE_NOT_FOUND":
      return 404
    case "PHONE_ALREADY_IN_USE":
      return 409
    default:
      return 500
  }
}

export async function GET(req: NextRequest) {
  const token = extractBearerToken(req)
  if (!token) {
    return NextResponse.json(
      { success: false, error: "UNAUTHORIZED" },
      { status: 401 }
    )
  }

  const result = await getMobileProfile(token)
  if (!result.success) {
    return NextResponse.json(result, {
      status: mapProfileErrorStatus(result.error),
    })
  }

  return NextResponse.json(result, { status: 200 })
}

export async function PATCH(req: NextRequest) {
  const token = extractBearerToken(req)
  if (!token) {
    return NextResponse.json(
      { success: false, error: "UNAUTHORIZED" },
      { status: 401 }
    )
  }

  try {
    const body = await req.json()
    const result = await updateMobileProfile(token, body)

    if (!result.success) {
      return NextResponse.json(result, {
        status: mapProfileErrorStatus(result.error),
      })
    }

    return NextResponse.json(result, { status: 200 })
  } catch {
    return NextResponse.json(
      { success: false, error: "INVALID_REQUEST_BODY" },
      { status: 400 }
    )
  }
}