"use client"

import { useCurrency } from "@/lib/context/currency-context"

interface ProductPriceProps {
  priceInCents: number // مثال: 1500 تعني 15.00 دولار
}

export function ProductPrice({ priceInCents }: ProductPriceProps) {
  const { formatPrice } = useCurrency()

  return (
    <span className="text-base font-bold text-foreground">
      {formatPrice(priceInCents)}
    </span>
  )
}