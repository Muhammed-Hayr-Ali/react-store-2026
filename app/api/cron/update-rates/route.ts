// app/api/cron/update-rates/route.ts

import { createAdminClient } from "@/lib/database/supabase/admin"
import { CurrencyCode } from "@/lib/database/types/enums"
import { NextResponse } from "next/server"

// Force dynamic rendering - Required for API routes
export const dynamic = "force-dynamic"
export const runtime = "nodejs"

// تعريف نوع البيانات للاستجابة من API
interface ExchangeRateResponse {
  result: string
  base_code: string
  conversion_rates: {
    [key: string]: number
  }
}

export async function GET() {
  try {
    console.log("💱 Fetching latest exchange rates...")
    const apiKey = process.env.EXCHANGERATE_API_KEY
    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch exchange rates: ${response.statusText}`)
    }

    const data: ExchangeRateResponse = await response.json()

    if (data.result !== "success") {
      throw new Error("Exchange rate API did not return success.")
    }

    const ratesToUpsert = ["SYP", "SAR", "EGP", "TRY", "EUR", "AED"]
      .filter((code) => data.conversion_rates[code])
      .map((code) => ({
        currency_code: code as CurrencyCode,
        rate_from_usd: data.conversion_rates[code],
        last_updated_at: new Date().toISOString(),
      }))

    if (ratesToUpsert.length === 0) {
      throw new Error("No target currencies found in API response.")
    }

    // 5. الاتصال بـ Supabase وتحديث قاعدة البيانات
    const supabaseAdmin = createAdminClient()

    console.log(`📊 Updating ${ratesToUpsert.length} exchange rates...`)
    const { error: upsertError } = await supabaseAdmin
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from("exchange_rates")
      .upsert(ratesToUpsert as any, { onConflict: "currency_code" })

    if (upsertError) {
      console.error("❌ Database upsert failed:", upsertError)
      throw upsertError
    }

    console.log(
      `✅ Successfully updated ${ratesToUpsert.length} exchange rates.`
    )

    // 6. إرجاع استجابة نجاح
    return NextResponse.json({
      success: true,
      message: `Successfully updated ${ratesToUpsert.length} rates.`,
      currencies: ratesToUpsert.map((r) => r.currency_code),
      timestamp: new Date().toISOString(),
    })
  } catch (error: unknown) {
    console.error("❌ Cron job error:", error)

    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: "Unknown error occurred",
      },
      { status: 500 }
    )
  }
}
