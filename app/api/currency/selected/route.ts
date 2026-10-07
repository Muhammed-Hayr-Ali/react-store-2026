import { NextResponse } from "next/server"
import { getSelectedCurrency } from "@/lib/actions/currency/queries/get-selected-currency"


//localhost:3000/api/currency/selected
 export async function GET() {
  try {
    const selectedCurrency = await getSelectedCurrency()

    return NextResponse.json({
      success: true,
      selectedCurrency,
      isDefault: selectedCurrency === "USD",
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
