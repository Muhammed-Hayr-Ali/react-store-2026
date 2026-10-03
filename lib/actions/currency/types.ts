/**
 * @file lib/actions/currency/types.ts
 * @description Pure TypeScript type definitions and constants for multi-currency handling.
 * Safe for direct import across both Client and Server Components.
 */

import { z } from "zod"
import { exchangeRateSchema } from "./schemas"

// ============================================================================
// Constants
// ============================================================================

export const DEFAULT_CURRENCY = "USD" as const

export const SUPPORTED_CURRENCIES = [
  { code: "USD", key: "USD", locale: "en-US", symbol: "$" },
  { code: "SYP", key: "SYP", locale: "ar-SY", symbol: "ل.س" },
  { code: "SAR", key: "SAR", locale: "ar-SA", symbol: "ر.س" },
  { code: "EGP", key: "EGP", locale: "ar-EG", symbol: "ج.م" },
  { code: "TRY", key: "TRY", locale: "tr-TR", symbol: "₺" },
  { code: "EUR", key: "EUR", locale: "de-DE", symbol: "€" },
  { code: "AED", key: "AED", locale: "ar-AE", symbol: "د.إ" },
] as const

// ============================================================================
// Entity & Derived Types
// ============================================================================

export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number]["code"]
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number]
export type ExchangeRate = z.infer<typeof exchangeRateSchema>
