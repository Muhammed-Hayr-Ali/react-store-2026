import { cookies } from "next/headers"
import { CurrencyCode, SUPPORTED_CURRENCIES } from "../types"

export const DEFAULT_CURRENCY: CurrencyCode = "USD"

/**
 * جلب العملة المختارة من الكوكيز (Server-only)
 */
export async function getSelectedCurrency(): Promise<CurrencyCode> {
  const cookieStore = await cookies()
  const currency = cookieStore.get("currency")?.value as CurrencyCode

  return SUPPORTED_CURRENCIES.some((c) => c.code === currency)
    ? currency
    : DEFAULT_CURRENCY
}
