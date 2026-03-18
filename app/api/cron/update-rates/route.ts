// app/api/cron/update-rates/route.ts

import { siteConfig } from "@/lib/config/site_config"
import { createAdminClient } from "@/lib/supabase/createAdminClient "
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

/**
 * Cron Job Handler for Updating Exchange Rates
 *
 * Called automatically by Vercel Cron based on vercel.json schedule
 * Fetches latest USD exchange rates and updates the database
 *
 * @example
 * curl http://localhost:3000/api/cron/update-rates
 */
export async function GET() {
  try {
    // 2. التحقق من وجود متغيرات البيئة
    if (!process.env.EXCHANGERATE_API_KEY) {
      console.error("❌ EXCHANGERATE_API_KEY is not configured")
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: "EXCHANGERATE_API_KEY not configured",
        }),
        { status: 500 }
      )
    }

    // 3. الاتصال بـ API أسعار الصرف
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

    // 4. تحديد العملات التي نهتم بها
    const ratesToUpsert = siteConfig.targetCurrencies
      .filter((code) => data.conversion_rates[code])
      .map((code) => ({
        currency_code: code,
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
      .from("exchange_rates")
      .upsert(ratesToUpsert, { onConflict: "currency_code" })

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
