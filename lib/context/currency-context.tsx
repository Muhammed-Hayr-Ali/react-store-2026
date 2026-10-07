// lib/context/currency-context.tsx
"use client"

import React, { createContext, useContext } from "react"
import { CurrencyCode } from "@/lib/actions/currency/types"
import { formatPrice as formatPriceUtil } from "@/lib/actions/currency/utils"

interface CurrencyContextValue {
  currency: CurrencyCode
  rate: number
  format: (priceInCents: number) => string
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null)

export function CurrencyProvider({
  currency,
  rate,
  children,
}: {
  currency: CurrencyCode
  rate: number
  children: React.ReactNode
}) {
  const format = React.useCallback(
    (priceInCents: number) => formatPriceUtil(priceInCents, currency, rate),
    [currency, rate]
  )

  return (
    <CurrencyContext.Provider value={{ currency, rate, format }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext)
  if (!ctx) {
    throw new Error("useCurrency must be used within CurrencyProvider")
  }
  return ctx
}
