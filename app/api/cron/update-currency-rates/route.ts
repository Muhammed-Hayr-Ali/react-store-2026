/**
 * @file app/api/cron/update-currency-rates/route.ts
 * @description Cron job endpoint to fetch latest exchange rates from exchangerate-api.com and update Supabase.
 */

import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/database/supabase/server"

// قائمة العملات المستهدفة
const TARGET_CURRENCIES = [
  "USD", "EUR", "SAR", "AED", "KWD", 
  "QAR", "BHD", "JOD", "EGP", "IQD", "SYP"
] as const

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

    // 3. تحديث كل عملة في قاعدة البيانات
    for (const code of TARGET_CURRENCIES) {
      const rateValue = rates[code]
      if (typeof rateValue === "number") {
        // تحويل السعر إلى رقم صحيح بدقة 4 منازل عشرية (ضرب في 10,000)
        const rateFactor = Math.round(rateValue * 10000)

        await supabase
          .from("currencies")
          .update({ 
            rate_factor: rateFactor, 
            updated_at: new Date().toISOString() 
          })
          .eq("code", code)
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: "Currency rates updated successfully in database" 
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}