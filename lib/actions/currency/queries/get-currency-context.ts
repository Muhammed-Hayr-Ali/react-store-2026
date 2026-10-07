"use server"

import { cache } from "react"
import { getSelectedCurrency } from "./get-selected-currency"
import { getExchangeRates } from "./get-rates"
import { CurrencyCode, DEFAULT_CURRENCY } from "../types"

export type CurrencyContextType = {
  currency: CurrencyCode
  rate: number
}

export const getCurrencyContext = cache(
  async (): Promise<CurrencyContextType> => {
    const [currency, rates] = await Promise.all([
      getSelectedCurrency(),
      getExchangeRates(),
    ])

    const match = rates.find((r) => r.currency_code === currency)
    const rate = match && match.rate_from_usd > 0 ? match.rate_from_usd : 1

    return {
      currency: match ? currency : DEFAULT_CURRENCY,
      rate,
    }
  }
)
