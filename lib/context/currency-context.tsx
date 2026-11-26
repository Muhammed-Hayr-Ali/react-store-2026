"use client"

import * as React from "react"
import type { AppLocale } from "@/i18n/routing"
import type { ExchangeRateRow } from "@/lib/actions/store/queries/get-exchange-rate"

export type SupportedCurrencyCode = "USD" | "SYP"

export interface StoreCurrency {
  code: SupportedCurrencyCode
  name: string
  name_ar: string
  symbol: string
}

const STORE_CURRENCIES: StoreCurrency[] = [
  {
    code: "USD",
    name: "US Dollar",
    name_ar: "دولار أمريكي",
    symbol: "$",
  },
  {
    code: "SYP",
    name: "Syrian Pound",
    name_ar: "ليرة سورية",
    symbol: "ل.س",
  },
]

interface CurrencyContextType {
  currentCurrency: StoreCurrency
  setCurrency: (code: SupportedCurrencyCode | string) => void
  currencies: StoreCurrency[]
  storeRate: number
  exchangeRateData: ExchangeRateRow | null
  convertFromCents: (priceInCents: number) => number
  formatPrice: (priceInCents: number) => string
  formatRawPrice: (priceInCents: number) => string
}

const CurrencyContext = React.createContext<CurrencyContextType | undefined>(
  undefined
)

interface CurrencyProviderProps {
  children: React.ReactNode
  exchangeRateData: ExchangeRateRow | null
  defaultCurrencyCode?: string
  locale: AppLocale
}

export function CurrencyProvider({
  children,
  exchangeRateData,
  defaultCurrencyCode = "USD",
  locale,
}: CurrencyProviderProps) {
  // سعر الصرف المعتمد للمتجر (المقرب للأعلى في قاعدة البيانات)
  const storeRate = exchangeRateData?.store_rate ?? 1

  const [currentCurrency, setCurrentCurrency] = React.useState<StoreCurrency>(
    () => {
      return (
        STORE_CURRENCIES.find((c) => c.code === defaultCurrencyCode) ||
        STORE_CURRENCIES[0]
      )
    }
  )

  const setCurrency = React.useCallback((code: string) => {
    const normalized = code.toUpperCase()
    const found = STORE_CURRENCIES.find((c) => c.code === normalized)
    if (found) {
      setCurrentCurrency(found)
      document.cookie = `app_currency=${found.code}; path=/; max-age=31536000; SameSite=Lax`
    }
  }, [])

  // تحويل السعر من سنتات الدولار إلى القيمة الرقمية النهائية حسب العملة المختارة
  const convertFromCents = React.useCallback(
    (priceInCents: number): number => {
      if (!Number.isFinite(priceInCents) || priceInCents <= 0) return 0

      const usdAmount = priceInCents / 100

      if (currentCurrency.code === "SYP") {
        // ضرب الدولار بسعر الصرف المعتمد وتقريب الناتج للعدد الصحيح الأعلى دائماً
        return Math.ceil(usdAmount * storeRate)
      }

      return Number(usdAmount.toFixed(2))
    },
    [currentCurrency.code, storeRate]
  )

  // 1. ترجع السعر منسقاً مع رمز العملة
  const formatPrice = React.useCallback(
    (priceInCents: number): string => {
      const amount = convertFromCents(priceInCents)

      if (currentCurrency.code === "SYP") {
        const formattedNumber = new Intl.NumberFormat(
          locale === "ar" ? "ar-SY" : "en-US",
          {
            style: "decimal",
            maximumFractionDigits: 0,
          }
        ).format(amount)

        const label = locale === "ar" ? "ل.س" : "SYP"
        return `${formattedNumber} ${label}`
      }

      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        currencyDisplay: "symbol",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount)
    },
    [convertFromCents, currentCurrency.code, locale]
  )

  // 2. ترجع الرقم منسقاً بدون رمز العملة تماماً
  const formatRawPrice = React.useCallback(
    (priceInCents: number): string => {
      const amount = convertFromCents(priceInCents)

      if (currentCurrency.code === "SYP") {
        return new Intl.NumberFormat(locale === "ar" ? "ar-SY" : "en-US", {
          style: "decimal",
          maximumFractionDigits: 0,
        }).format(amount)
      }

      return new Intl.NumberFormat("en-US", {
        style: "decimal",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount)
    },
    [convertFromCents, currentCurrency.code, locale]
  )

  return (
    <CurrencyContext.Provider
      value={{
        currentCurrency,
        setCurrency,
        currencies: STORE_CURRENCIES,
        storeRate,
        exchangeRateData,
        convertFromCents,
        formatPrice,
        formatRawPrice,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency(): CurrencyContextType {
  const context = React.useContext(CurrencyContext)
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider")
  }
  return context
}