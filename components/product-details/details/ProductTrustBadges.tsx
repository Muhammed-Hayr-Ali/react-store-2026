"use client"

/**
 * @file components/store/product-details/details/ProductTrustBadges.tsx
 * @description Apple-inspired minimalist trust badges section featuring shipping, returns, and secure checkout.
 */

import { useTranslations } from "next-intl"
import { TruckIcon, RotateCcwIcon, ShieldCheckIcon } from "lucide-react"

const BADGES = [
  { key: "FAST_DISPATCH", Icon: TruckIcon },
  { key: "EASY_RETURNS", Icon: RotateCcwIcon },
  { key: "SECURE_CHECKOUT", Icon: ShieldCheckIcon },
] as const

export function ProductTrustBadges() {
  const t = useTranslations("ProductDetails")

  return (
    <ul className="grid grid-cols-3 divide-x divide-border/60 rounded-2xl border border-border/60 py-4 text-center text-xs text-muted-foreground">
      {BADGES.map(({ key, Icon }) => (
        <li key={key} className="flex flex-col items-center gap-2 px-2">
          <Icon aria-hidden className="size-5 stroke-[1.5] text-foreground" />
          <span>{t(key)}</span>
        </li>
      ))}
    </ul>
  )
}
