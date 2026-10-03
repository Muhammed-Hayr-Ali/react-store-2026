/**
 * @file lib/actions/currency/queries/get-rates.ts
 * @description Query to retrieve exchange rates relative to USD from Supabase.
 * Validates database rows against schema and provides a safe fallback rate list.
 */

"use server"

import { z } from "zod"
import { createServerClient } from "@/lib/database/supabase/server"
import { ApiResult } from "@/lib/database/types/utils"
import { ExchangeRate } from "../types"
import { exchangeRateSchema } from "../schemas"

// ============================================================================
// Main Query Function
// ============================================================================

export async function getExchangeRates(): Promise<ExchangeRate[]> {
  // 1. Initialize Supabase client
  const supabase = await createServerClient()

  // 2. Query exchange rates table
  const { data, error } = await supabase
    .from("exchange_rates")
    .select("currency_code, rate_from_usd, updated_at")

  if (error) {
    console.error("Database error in getExchangeRates:", error.message)
    return []
  }

  // 3. Verify returned dataset matches schema
  const parsedData = z.array(exchangeRateSchema).safeParse(data || [])
  if (!parsedData.success) {
    console.error(
      "Database schema mismatch in getExchangeRates:",
      parsedData.error
    )
    return []
  }

  return parsedData.data
}

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
