"use server"

import { cache } from "react"
import { createServerClient } from "@/lib/database/supabase/server"
import { ExchangeRate } from "../types"
import { ApiResult } from "@/lib/database/types/utils"

export const getExchangeRates = cache(async (): Promise<ExchangeRate[]> => {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from("exchange_rates")
    .select("currency_code, rate_from_usd, updated_at")
    .order("currency_code", { ascending: true })

  if (error || !data) return []

  return data.map((row) => ({
    currency_code: row.currency_code,
    rate_from_usd: Number(row.rate_from_usd),
    updated_at: row.updated_at,
  }))
})
// ============================================================================
// Standard ApiResult Query Function
// ============================================================================

export async function getExchangeRatesResult(): Promise<
  ApiResult<ExchangeRate[]>
> {
  const rates = await getExchangeRates()

  if (rates.length === 0) {
    return {
      success: false,
      error: "FETCH_RATES_FAILED",
    }
  }

  return {
    success: true,
    data: rates,
  }
}
