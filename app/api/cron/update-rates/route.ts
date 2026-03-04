// app/api/cron/update-rates/route.ts

import { siteConfig } from "@/lib/config/site";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// تعريف نوع البيانات للاستجابة من API
interface ExchangeRateResponse {
  result: string;
  base_code: string;
  conversion_rates: {
    [key: string]: number;
  };
}

// نستخدم 'force-dynamic' لضمان أن يتم تنفيذ هذا الكود ديناميكيًا عند كل طلب
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. جلب مفتاح API من متغيرات البيئة
    const apiKey = process.env.EXCHANGERATE_API_KEY;
    if (!apiKey) {
      throw new Error(
        "EXCHANGERATE_API_KEY is not set in environment variables.",
      );
    }

    // 2. الاتصال بـ API أسعار الصرف
    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`,
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch exchange rates: ${response.statusText}`);
    }
    const data: ExchangeRateResponse = await response.json();

    if (data.result !== "success") {
      throw new Error("Exchange rate API did not return success.");
    }

    // 3. تحديد العملات التي نهتم بها
    const ratesToUpsert = siteConfig.targetCurrencies
      .filter((code) => data.conversion_rates[code])
      .map((code) => ({
        currency_code: code,
        rate_from_usd: data.conversion_rates[code],
        last_updated_at: new Date().toISOString(),
      }));

    if (ratesToUpsert.length === 0) {
      throw new Error("No target currencies found in API response.");
    }

    // 4. إنشاء عميل Supabase (آمن للاستخدام على الخادم)
    // نستخدم متغيرات البيئة التي لا تبدأ بـ NEXT_PUBLIC_ لأن هذا الكود يعمل على الخادم فقط
    const supabaseAdmin = createAdminClient();
    // 5. تحديث قاعدة البيانات باستخدام upsert
    const { error: upsertError } = await supabaseAdmin
      .from("exchange_rates")
      .upsert(ratesToUpsert, { onConflict: "currency_code" });

    if (upsertError) {
      throw upsertError;
    }

    console.log(`Successfully updated ${ratesToUpsert.length} exchange rates.`);

    // 6. إرجاع استجابة نجاح
    return NextResponse.json({
      message: `Updated ${ratesToUpsert.length} rates.`,
    });
  } catch (error: unknown) {
    console.error(error);
    if (isError(error)) {
      console.error(error);
      return NextResponse.json(
        { error: error.message || "Unknown error." },
        { status: 500 },
      );
    }
  }
}

function isError(error: unknown): error is Error {
  return (
    typeof (error as Error).message === "string" &&
    typeof (error as Error).stack === "string"
  );
}
