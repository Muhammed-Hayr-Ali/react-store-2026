/**
 * @file lib/actions/currency/queries/get-selected-currency.ts
 * @description Server-only utility to retrieve the current active currency from cookies.
 * Falls back to default currency (USD) when cookie is missing or invalid.
 */

import { cookies } from "next/headers"
import { CurrencyCode, DEFAULT_CURRENCY, SUPPORTED_CURRENCIES } from "../types"

// ============================================================================
// Main Query Function
// ============================================================================

export async function getSelectedCurrency(): Promise<CurrencyCode> {
  // 1. Read currency value from cookie store
  const cookieStore = await cookies()
  const cookieCurrency = cookieStore.get("currency")?.value

  // 2. Validate cookie value against supported list
  const isSupported = SUPPORTED_CURRENCIES.some(
    (c) => c.code === cookieCurrency
  )

  return isSupported ? (cookieCurrency as CurrencyCode) : DEFAULT_CURRENCY
}
