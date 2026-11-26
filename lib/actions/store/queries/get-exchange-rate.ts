"use server"

import { createServerClient } from "@/lib/database/supabase/server"

export interface ExchangeRateRow {
  id: string
  currency_code: string
  city: string
  unit: string
  raw_buy: number
  raw_sell: number
  store_rate: number
  source_updated_at: string | null
  fetched_at: string
  updated_at: string
}

export interface ExchangeRateActionResponse {
  ok: boolean
  unit: string
  currencyCode: string
  city: string
  sourceUpdatedAt: string | null
  count: number
  rate: ExchangeRateRow | null
  error?: string
}

export async function getStoreExchangeRate(
  currencyCode: string = "USD",
  unit: string = "new"
): Promise<ExchangeRateActionResponse> {
  const normalizedCode = currencyCode.trim().toUpperCase() || "USD"
  const normalizedUnit = unit.trim().toLowerCase() || "new"

  try {
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from("exchange_rates")
      .select(
        "id, currency_code, city, unit, raw_buy, raw_sell, store_rate, source_updated_at, fetched_at, updated_at"
      )
      .eq("currency_code", normalizedCode)
      .eq("unit", normalizedUnit)
      .maybeSingle<ExchangeRateRow>()

    if (error || !data) {
      return {
        ok: false,
        unit: normalizedUnit,
        currencyCode: normalizedCode,
        city: "damascus",
        sourceUpdatedAt: null,
        count: 0,
        rate: null,
        error: error?.message ?? "No exchange rate found",
      }
    }

    return {
      ok: true,
      unit: data.unit,
      currencyCode: data.currency_code,
      city: data.city,
      sourceUpdatedAt: data.source_updated_at,
      count: 1,
      rate: data,
    }
  } catch (err) {
    return {
      ok: false,
      unit: normalizedUnit,
      currencyCode: normalizedCode,
      city: "damascus",
      sourceUpdatedAt: null,
      count: 0,
      rate: null,
      error: err instanceof Error ? err.message : "Unexpected error",
    }
  }
}