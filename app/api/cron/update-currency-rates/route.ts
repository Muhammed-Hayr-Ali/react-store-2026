/**
 * @file app/api/cron/update-currency-rates/route.ts
 * @description Cron job endpoint to fetch latest exchange rates from exchangerate-api.com and bulk upsert Supabase.
 */

import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/database/supabase/server"

// بيانات العملات الأساسية لضمان عدم حدوث خطأ Not-Null Constraint في الجدول
const CURRENCY_METADATA: Record<string, { name: string; name_ar: string; symbol: string }> = {
  USD: { name: "US Dollar", name_ar: "دولار أمريكي", symbol: "$" },
  EUR: { name: "Euro", name_ar: "يورو", symbol: "€" },
  SAR: { name: "Saudi Riyal", name_ar: "ريال سعودي", symbol: "ر.س" },
  AED: { name: "UAE Dirham", name_ar: "درهم إماراتي", symbol: "د.إ" },
  KWD: { name: "Kuwaiti Dinar", name_ar: "دينار كويتي", symbol: "د.ك" },
  QAR: { name: "Qatari Riyal", name_ar: "ريال قطري", symbol: "ر.ق" },
  BHD: { name: "Bahraini Dinar", name_ar: "دينار بحريني", symbol: "د.ب" },
  TRY: { name: "Turkish Lira", name_ar: "ليرة تركية", symbol: "₺" },
  EGP: { name: "Egyptian Pound", name_ar: "جنيه مصري", symbol: "ج.م" },
  IQD: { name: "Iraqi Dinar", name_ar: "دينار عراقي", symbol: "د.ع" },
  SYP: { name: "Syrian Pound", name_ar: "ليرة سورية", symbol: "ل.س" },
} as const

interface ExchangeRateResponse {
  result: string
  conversion_rates: Record<string, number>
}

export async function GET(request: Request) {
  // 1. التحقق من مفتاح الحماية الخاص بـ Vercel Cron
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  try {
    const apiKey = process.env.EXCHANGE_RATE_API_KEY
    if (!apiKey) {
      throw new Error("EXCHANGE_RATE_API_KEY is not defined in environment variables")
    }

    // 2. جلب الأسعار من الـ API
    const response = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`)
    const data = (await response.json()) as ExchangeRateResponse

    if (data.result !== "success" || !data.conversion_rates) {
      throw new Error("Failed to fetch rates from ExchangeRate-API")
    }

    const rates = data.conversion_rates
    const supabase = await createServerClient()

    const currencyRecords = []

    // 3. تجهيز بيانات العملات المستهدفة للتحديث الجماعي (Upsert)
    for (const [code, meta] of Object.entries(CURRENCY_METADATA)) {
      const rateValue = rates[code]
      
      if (typeof rateValue === "number") {
        // تحويل السعر إلى رقم صحيح بدقة 4 منازل عشرية (ضرب في 10,000)
        const rateFactor = Math.round(rateValue * 10000)

        currencyRecords.push({
          code,
          name: meta.name,
          name_ar: meta.name_ar,
          symbol: meta.symbol,
          rate_factor: rateFactor,
          is_active: true,
          updated_at: new Date().toISOString()
        })
      }
    }

    // 4. تنفيذ التحديث في قاعدة البيانات
    if (currencyRecords.length > 0) {
      const { error } = await supabase
        .from("currencies")
        .upsert(currencyRecords, { onConflict: "code" })

      if (error) {
        throw new Error(`Database upsert failed: ${error.message}`)
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: "Currency rates updated successfully in database via cron job" 
    }, { status: 200 })

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}