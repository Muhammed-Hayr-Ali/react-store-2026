import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

interface CityRatePayload {
  buy: number
  sell: number
  change?: number
  prev_close?: number
  day_high?: number
  day_low?: number
  change_week?: number
  change_month?: number
  change_year?: number
}

interface SpTodayCurrencyResponse {
  ok: boolean
  data?: {
    currency?: {
      code?: string
      slug?: string
      name?: string
      name_ar?: string
      cities?: Record<string, CityRatePayload>
      updated_at?: string
    }
    unit?: string
  }
  error?: {
    code?: string
    message?: string
  }
}

function getSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export async function POST(request: NextRequest) {
  try {
    // التحقق الاختياري من سر الاستدعاء إذا تم ضبط EXCHANGE_RATE_CRON_SECRET
    const cronSecret = process.env.EXCHANGE_RATE_CRON_SECRET
    if (cronSecret) {
      const authHeader = request.headers.get("authorization")
      const headerSecret = request.headers.get("x-cron-secret")
      const isAuthorized =
        authHeader === `Bearer ${cronSecret}` || headerSecret === cronSecret

      if (!isAuthorized) {
        return NextResponse.json(
          { ok: false, error: "Unauthorized" },
          { status: 401 }
        )
      }
    }

    const apiKey = process.env.SP_TODAY_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { ok: false, error: "SP_TODAY_API_KEY is not configured" },
        { status: 500 }
      )
    }

    const url = new URL("https://api-v2.sp-today.com/api/v1/currency/usd")
    url.searchParams.set("unit", "new")
    url.searchParams.set("api_key", apiKey)

    const apiResponse = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "X-API-Key": apiKey,
      },
      cache: "no-store",
    })

    const payload = (await apiResponse.json()) as SpTodayCurrencyResponse

    if (!apiResponse.ok || !payload.ok || !payload.data?.currency) {
      return NextResponse.json(
        {
          ok: false,
          error: payload.error?.message ?? "Failed to fetch rate from SPToday API",
        },
        { status: 502 }
      )
    }

    const currency = payload.data.currency
    const currencyCode = (currency.code ?? "USD").toUpperCase()
    const unit = (payload.data.unit ?? "new").toLowerCase()
    const cities = currency.cities ?? {}
    const cityEntries = Object.entries(cities)

    if (cityEntries.length === 0) {
      return NextResponse.json(
        { ok: false, error: "No city rates found in SPToday response" },
        { status: 422 }
      )
    }

    const supabase = getSupabaseAdminClient()
    const savedRates = []

    for (const [cityKey, cityRate] of cityEntries) {
      const { data: row, error } = await supabase.rpc("upsert_exchange_rate", {
        p_currency_code: currencyCode,
        p_city: cityKey,
        p_unit: unit,
        p_raw_buy: Number(cityRate.buy),
        p_raw_sell: Number(cityRate.sell),
        p_source_updated_at: currency.updated_at ?? null,
      })

      if (error) {
        return NextResponse.json(
          { ok: false, error: `Database error for ${cityKey}: ${error.message}` },
          { status: 500 }
        )
      }

      savedRates.push(row)
    }

    return NextResponse.json({
      ok: true,
      unit,
      currencyCode,
      sourceUpdatedAt: currency.updated_at ?? null,
      count: savedRates.length,
      rates: savedRates,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error"
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

// دعم GET لتسهيل الاختبار السريع من المتصفح أو أدوات الفحص
export async function GET(request: NextRequest) {
  return POST(request)
}