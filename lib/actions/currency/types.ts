export const DEFAULT_CURRENCY = "USD" as const

export type ExchangeRate = {
  currency_code: string // e.g., "SYP", "SAR", "USD"
  rate_from_usd: number // e.g., 121.845, 3.75, 1
  updated_at: string
}

// export const SUPPORTED_CURRENCIES = [
//   { code: "USD", symbol: "$", locale: "en-US" },
//   { code: "SAR", symbol: "ر.س", locale: "ar-SA" },
//   { code: "SYP", symbol: "ل.س", locale: "ar-SY" },
// ] as const

export const SUPPORTED_CURRENCIES = [
  { code: "USD", key: "USD", locale: "en-US", symbol: "$" },
  { code: "SYP", key: "SYP", locale: "ar-SY", symbol: "ل.س" },
  { code: "SAR", key: "SAR", locale: "ar-SA", symbol: "ر.س" },
  { code: "EGP", key: "EGP", locale: "ar-EG", symbol: "ج.م" },
  { code: "TRY", key: "TRY", locale: "tr-TR", symbol: "₺" },
  { code: "EUR", key: "EUR", locale: "de-DE", symbol: "€" },
  { code: "AED", key: "AED", locale: "ar-AE", symbol: "د.ا" },
] as const



export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number]["code"]
