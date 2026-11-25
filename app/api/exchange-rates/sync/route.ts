import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

interface CityRatePayload {
  buy: number
  sell: number
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

function isAuthorizedRequest(request: NextRequest): boolean {
  const expectedSecret =
    process.env.EXCHANGE_RATE_CRON_SECRET || process.env.CRON_SECRET

  // إذا لم يُضبط أي سر مطلقاً، يُسمح بالطلب
  if (!expectedSecret) {
    return true
  }

  const authHeader = request.headers.get("authorization")
  const headerSecret = request.headers.get("x-cron-secret")

  const matchesBearer = authHeader === `Bearer ${expectedSecret}`
  const matchesHeader = headerSecret === expectedSecret

  if (matchesBearer || matchesHeader) {
    return true
  }

  // السماح بالاختبار المباشر من المتصفح فقط أثناء التطوير المحلي
  if (process.env.NODE_ENV === "development") {
    return true
  }

  return false
}

async function handleSync(request: NextRequest) {
  try {
    if (!isAuthorizedRequest(request)) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      )
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
    const cityEntries = Object.entries(currency.cities ?? {})

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

export async function GET(request: NextRequest) {
  return handleSync(request)
}

export async function POST(request: NextRequest) {
  return handleSync(request)
}