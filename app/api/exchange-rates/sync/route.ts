import { cache } from "react"
import { createServerClient } from "@/lib/database/supabase/server"
import type { Tables } from "@/lib/database/supabase/types"

export type ExchangeRateRow = Tables<"exchange_rates">

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

export const getStoreExchangeRate = cache(
  async (
    currencyCode: string = "USD",
    unit: string = "new"
  ): Promise<ExchangeRateActionResponse> => {
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
        .maybeSingle()

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
)