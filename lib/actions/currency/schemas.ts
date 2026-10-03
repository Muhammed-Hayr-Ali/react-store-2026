/**
 * @file lib/actions/currency/schemas.ts
 * @description Zod validation schemas for currency codes and exchange rates.
 * Enforces runtime data contracts for cookies and database responses.
 */

import { z } from "zod"

// ============================================================================
// Currency Code Schema
// ============================================================================

export const currencyCodeSchema = z.enum(
  ["USD", "SYP", "SAR", "EGP", "TRY", "EUR", "AED"],
  {
    message: "UNSUPPORTED_CURRENCY_CODE",
  }
)

// ============================================================================
// Exchange Rate Schema
// ============================================================================

export const exchangeRateSchema = z.object({
  currency_code: z.string().min(1, "CURRENCY_CODE_REQUIRED"),
  rate_from_usd: z.number().positive("RATE_MUST_BE_POSITIVE"),
  updated_at: z.string(),
})
