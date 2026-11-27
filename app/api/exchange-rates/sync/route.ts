import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    // 1. التحقق من مفتاح الحماية الخاص بـ Vercel Cron
    const authHeader = request.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    // 2. التحقق من متغيرات البيئة المطلوبة
    const apiUrl = process.env.EXCHANGE_RATE_API_URL
    const apiKey = process.env.EXCHANGE_RATE_API_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!apiUrl || !supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { ok: false, error: "Missing required environment variables" },
        { status: 500 }
      )
    }

    // 3. جلب سعر الصرف من المصدر الخارجي
    const url = new URL(apiUrl)
    if (!url.searchParams.has("unit")) {
      url.searchParams.set("unit", "new")
    }

    const res = await fetch(url.toString(), {
      headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : undefined,
      cache: "no-store",
    })

    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: `Upstream API error: ${res.status}` },
        { status: 502 }
      )
    }

    const payload = await res.json()

    // استخراج بيانات دمشق (سواء كانت الاستجابة مصفوفة أو كائناً)
    const ratesList = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.data)
        ? payload.data
        : [payload]

    const damascusRate =
      ratesList.find(
        (item: Record<string, unknown>) =>
          String(item?.city ?? item?.governorate ?? item?.region ?? "")
            .toLowerCase()
            .includes("damascus")
      ) ?? ratesList[0]

    const buyRate = Number(damascusRate?.buy ?? damascusRate?.buy_rate ?? 0)
    const sellRate = Number(damascusRate?.sell ?? damascusRate?.sell_rate ?? 0)

    if (!buyRate && !sellRate) {
      return NextResponse.json(
        { ok: false, error: "Invalid exchange rate payload" },
        { status: 422 }
      )
    }

    const effectiveRate = sellRate || buyRate
    const storeRate = Math.ceil(effectiveRate)

    // 4. تحديث قاعدة البيانات في Supabase عبر Service Role
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    })

    const { error: rpcError } = await supabase.rpc("upsert_exchange_rate", {
      p_city: "damascus",
      p_currency: "USD",
      p_buy_rate: buyRate,
      p_sell_rate: sellRate,
      p_store_rate: storeRate,
    })

    if (rpcError) {
      return NextResponse.json(
        { ok: false, error: rpcError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      city: "damascus",
      buy_rate: buyRate,
      sell_rate: sellRate,
      store_rate: storeRate,
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    )
  }
}