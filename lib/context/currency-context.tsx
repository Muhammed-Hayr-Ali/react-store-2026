/**
 * @file lib/context/currency-context.tsx
 * @description Global context providing currency formatting with separate price and symbol support.
 */

"use client"

import * as React from "react"
import type { AppLocale } from "@/i18n/routing"

export interface Currency {
  code: string
  name: string
  name_ar: string
  symbol: string
  rate_factor: number
}

interface CurrencyContextType {
  currentCurrency: Currency
  setCurrency: (code: string) => void
  currencies: Currency[]
  formatPrice: (priceInCents: number) => string
  formatRawPrice: (priceInCents: number) => string // ترجع الرقم منسقاً بدون رمز العملة
}

const CurrencyContext = React.createContext<CurrencyContextType | undefined>(undefined)

interface CurrencyProviderProps {
  children: React.ReactNode
  initialCurrencies: Currency[]
  defaultCurrencyCode?: string
  locale: AppLocale
}

export function CurrencyProvider({
  children,
  initialCurrencies,
  defaultCurrencyCode = "USD",
  locale,
}: CurrencyProviderProps) {
  const [currentCurrency, setCurrentCurrency] = React.useState<Currency>(() => {
    return initialCurrencies.find((c) => c.code === defaultCurrencyCode) || initialCurrencies[0]
  })

  const setCurrency = (code: string) => {
    const found = initialCurrencies.find((c) => c.code === code)
    if (found) {
      setCurrentCurrency(found)
      document.cookie = `app_currency=${code}; path=/; max-age=31536000; SameSite=Lax`
    }
  }

  // 1. الدالة الأصلية (مع رمز العملة)
  const formatPrice = React.useCallback(
    (priceInCents: number) => {
      const convertedCents = Math.round((priceInCents * currentCurrency.rate_factor) / 10000)
      const finalAmount = convertedCents / 100

      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currentCurrency.code,
        currencyDisplay: "symbol",
      }).format(finalAmount)
    },
    [currentCurrency, locale]
  )

  // 2. الدالة الجديدة (ترجع الرقم منسقاً بدون رمز العملة تماماً)
  const formatRawPrice = React.useCallback(
    (priceInCents: number) => {
      const convertedCents = Math.round((priceInCents * currentCurrency.rate_factor) / 10000)
      const finalAmount = convertedCents / 100

      return new Intl.NumberFormat(locale, {
        style: "decimal",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(finalAmount)
    },
    [currentCurrency, locale]
  )

  return (
    <CurrencyContext.Provider
      value={{
        currentCurrency,
        setCurrency,
        currencies: initialCurrencies,
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