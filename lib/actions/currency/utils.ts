/**
 * @file lib/actions/currency/utils.ts
 * @description Pure helper utilities for currency calculation and price formatting.
 * Converts integer prices in cents to target currencies with normalized numeral output.
 */

import { CurrencyCode, DEFAULT_CURRENCY, SUPPORTED_CURRENCIES } from "./types"

// ============================================================================
// Price Formatter Function
// ============================================================================

export function formatPrice(
  priceInCents: number,
  currencyCode: CurrencyCode,
  exchangeRate: number
): string {
  // 1. Normalize exchange rate to prevent division by zero or negative values
  const safeRate = exchangeRate > 0 ? exchangeRate : 1

  // 2. Convert base cents to USD and multiply by target currency rate
  const priceInUsd = priceInCents / 100
  const convertedPrice = priceInUsd * safeRate

  // 3. Resolve currency metadata for symbol presentation
  const currencyInfo =
    SUPPORTED_CURRENCIES.find((c) => c.code === currencyCode) ||
    SUPPORTED_CURRENCIES.find((c) => c.code === DEFAULT_CURRENCY) ||
    SUPPORTED_CURRENCIES[0]

  // 4. Format numbers using standard Western digits and thousand separators
  const formattedNumber = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(convertedPrice)

  // 5. Append matching currency symbol
  return `${formattedNumber} ${currencyInfo.symbol}`
}
