// lib/context/currency-context.tsx
"use client"

import React, { createContext, useContext, useTransition } from "react"
import { useRouter } from "next/navigation"
import { CurrencyCode } from "@/lib/actions/currency/types"
import { formatPrice as formatPriceUtil } from "@/lib/actions/currency/utils"
import { setUserCurrency } from "@/lib/actions/currency/mutations/set-currency"

interface CurrencyContextValue {
  currency: CurrencyCode
  rate: number
  isPending: boolean
  setCurrency: (newCurrency: CurrencyCode) => Promise<void>
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
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const setCurrency = React.useCallback(
    async (newCurrency: CurrencyCode) => {
      if (newCurrency === currency || isPending) return

      startTransition(async () => {
        try {
          await setUserCurrency(newCurrency)
          router.refresh()
        } catch (error) {
          console.error("Failed to update currency:", error)
        }
      })
    },
    [currency, isPending, router]
  )

  const format = React.useCallback(
    (priceInCents: number) => formatPriceUtil(priceInCents, currency, rate),
    [currency, rate]
  )

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        rate,
        isPending,
        setCurrency,
        format,
      }}
    >
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
