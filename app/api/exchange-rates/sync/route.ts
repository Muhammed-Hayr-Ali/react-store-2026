import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/database/supabase/admin"

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

  return createAdminClient()
}

function isAuthorizedRequest(request: NextRequest): boolean {
  const expectedSecret =
    process.env.EXCHANGE_RATE_CRON_SECRET || process.env.CRON_SECRET

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
    const damascusRate = currency.cities?.damascus

    if (!damascusRate) {
      return NextResponse.json(
        {
          ok: false,
          error: "Damascus exchange rate not found in SPToday response",
        },
        { status: 422 }
      )
    }

    const supabase = getSupabaseAdminClient()

    const { data: row, error } = await supabase.rpc("upsert_exchange_rate", {
      p_city: "damascus",
      p_currency_code: currencyCode,
      p_raw_buy: Number(damascusRate.buy),
      p_raw_sell: Number(damascusRate.sell),
      p_source_updated_at: currency.updated_at ?? undefined,
      p_unit: unit,
    })

    if (error) {
      return NextResponse.json(
        { ok: false, error: `Database error: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      unit,
      currencyCode,
      city: "damascus",
      sourceUpdatedAt: currency.updated_at ?? null,
      count: 1,
      rate: row,
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