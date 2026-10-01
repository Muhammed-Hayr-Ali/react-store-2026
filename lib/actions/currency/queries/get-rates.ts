"use server"

import { createServerClient } from "@/lib/database/supabase/server"
import { ExchangeRate } from "../types"

export async function getExchangeRates(): Promise<ExchangeRate[]> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("exchange_rates") // اسم جدولك في قاعدة البيانات
    .select("currency_code, rate_from_usd, updated_at")

  if (error) {
    console.error("Error fetching exchange rates:", error)
    return []
  }

  return data as ExchangeRate[]
}
