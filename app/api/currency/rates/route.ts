import { NextResponse } from "next/server"
import { getExchangeRatesResult } from "@/lib/actions/currency/queries/get-rates"

// http://localhost:3000/api/currency/rates

export async function GET() {
  try {
    const result = await getExchangeRatesResult()

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          message: "Failed to fetch exchange rates from the database",
        },
        { status: 500 }
      )
    }

    const rates = result.data ?? []

    return NextResponse.json({
      success: true,
      data: rates,
      count: rates.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "INTERNAL_SERVER_ERROR",
        message: error instanceof Error ? error.message : "Unexpected error",
      },
      { status: 500 }
    )
  }
}