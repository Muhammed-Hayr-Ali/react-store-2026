/**
 * @file lib/actions/currency/mutations/set-currency.ts
 * @description Server Action to persist the user's selected active currency in cookies.
 * Validates the requested code and updates the cookie store with a 1-year expiration.
 */

"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { ApiResult } from "@/lib/database/types/utils"
import { CurrencyCode } from "../types"
import { currencyCodeSchema } from "../schemas"

// ============================================================================
// Main Action Function
// ============================================================================

export async function setUserCurrency(
  currency: string
): Promise<ApiResult<CurrencyCode>> {
  // 1. Validate requested currency code against supported currencies
  const validation = currencyCodeSchema.safeParse(currency)
  if (!validation.success) {
    return {
      success: false,
      error: "INVALID_CURRENCY_CODE",
    }
  }

  const selectedCurrency = validation.data as CurrencyCode

  // 2. Persist currency in HTTP cookies
  const cookieStore = await cookies()
  cookieStore.set("currency", selectedCurrency, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year duration
    httpOnly: false, // Allow client components to read cookie if needed
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })

  // 3. Revalidate path to update active prices instantly
  revalidatePath("/")

  return {
    success: true,
    data: selectedCurrency,
  }
}
