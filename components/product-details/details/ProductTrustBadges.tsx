"use client"

/**
 * @file components/store/product-details/details/product-trust-badges.tsx
 * @description Apple-inspired minimalist trust badges section featuring shipping, returns, and secure checkout.
 */

import * as React from "react"
import { useTranslations } from "next-intl"
import { TruckIcon, RotateCcwIcon, ShieldCheckIcon } from "lucide-react"

export function ProductTrustBadges() {
  const t = useTranslations("ProductDetails")

  return (
    <div className="grid grid-cols-3 gap-2 border-t border-border/40 pt-6 text-center text-xs text-muted-foreground/90">
      <div className="flex flex-col items-center gap-1.5 transition-colors hover:text-foreground">
        <TruckIcon className="size-4 stroke-[1.5] text-foreground/70" />
        <span>{t("FAST_DISPATCH", { default: "Fast Dispatch" })}</span>
      </div>
      <div className="flex flex-col items-center gap-1.5 transition-colors hover:text-foreground">
        <RotateCcwIcon className="size-4 stroke-[1.5] text-foreground/70" />
        <span>{t("EASY_RETURNS", { default: "Easy Returns" })}</span>
      </div>
      <div className="flex flex-col items-center gap-1.5 transition-colors hover:text-foreground">
        <ShieldCheckIcon className="size-4 stroke-[1.5] text-foreground/70" />
        <span>{t("SECURE_CHECKOUT", { default: "Secure Checkout" })}</span>
      </div>
    </div>
  )
}