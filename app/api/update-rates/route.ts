import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/database/supabase/admin"

export const dynamic = "force-dynamic"

interface ExchangeRateResponse {
  result: string
  base_code: string
  conversion_rates: Record<string, number>
}

// قائمة العملات المطلوبة
const TARGET_CURRENCIES = ["SYP", "SAR", "EGP", "TRY", "EUR", "AED"]

export async function GET(request: Request) {
  try {
    // 1. التحقق من مفتاح الحماية لـ Cron Job
    const cronSecret = process.env.CRON_SECRET
    if (cronSecret) {
      const authHeader = request.headers.get("authorization")
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
    }

    // 2. جلب أحدث أسعار الصرف مقابل الدولار
    const apiKey = process.env.EXCHANGERATE_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is missing in environment variables" },
        { status: 500 }
      )
    }

    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`,
      { next: { revalidate: 0 } }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch exchange rates: ${response.statusText}`)
    }

    const data: ExchangeRateResponse = await response.json()

    if (data.result !== "success" || !data.conversion_rates) {
      throw new Error("Exchange rate API response was unsuccessful")
    }

    // 3. فلترة وتحضير العملات للتخزين
    const ratesToUpsert = TARGET_CURRENCIES.filter(
      (code) => data.conversion_rates[code] !== undefined
    ).map((code) => ({
      currency_code: code,
      rate_from_usd: data.conversion_rates[code],
      updated_at: new Date().toISOString(),
    }))

    if (ratesToUpsert.length === 0) {
      throw new Error("No target currencies found in response")
    }

    // 4. تحديث البيانات في Supabase
    const supabaseAdmin = createAdminClient()

    const { error: upsertError } = await supabaseAdmin
      .from("exchange_rates")
      .upsert(ratesToUpsert, { onConflict: "currency_code" })

    if (upsertError) {
      console.error("Database upsert error:", upsertError)
      throw upsertError
    }

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${ratesToUpsert.length} rates`,
      currencies: ratesToUpsert.map((r) => r.currency_code),
      updatedAt: new Date().toISOString(),
    })
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal Server Error"
    console.error("Cron update-rates error:", error)
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
