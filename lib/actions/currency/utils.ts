// lib/actions/currency/utils.ts

import { CurrencyCode, SUPPORTED_CURRENCIES } from "./types"

export function formatPrice(
  priceInCents: number,
  currencyCode: CurrencyCode,
  exchangeRate: number
): string {
  const safeRate = exchangeRate > 0 ? exchangeRate : 1
  const priceInUsd = priceInCents / 100
  const convertedPrice = priceInUsd * safeRate

  const currencyInfo =
    SUPPORTED_CURRENCIES.find((c) => c.code === currencyCode) ||
    SUPPORTED_CURRENCIES[0]

  // ✅ 1. تنسيق الرقم فقط بالأرقام الغربية (0-9) والفاصلة العادية (,)
  const formattedNumber = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(convertedPrice)

  // ✅ 2. إضافة رمز العملة العربي يدوياً من مصفوفة SUPPORTED_CURRENCIES
  return `${formattedNumber} ${currencyInfo.symbol}`
}
