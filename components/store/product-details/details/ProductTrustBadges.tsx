"use client"

/**
 * @file components/store/product-details/details/product-trust-badges.tsx
 * @description Trust badges section featuring shipping, returns, and secure checkout with full localization support.
 */

import * as React from "react"
import { useTranslations } from "next-intl"
import { TruckIcon, RotateCcwIcon, ShieldCheckIcon } from "lucide-react"

export function ProductTrustBadges() {
  const t = useTranslations("ProductDetails")

  return (
    <div className="grid grid-cols-3 gap-2 border-t border-border/60 pt-4 text-center text-[11px] text-muted-foreground">
      <div className="flex flex-col items-center gap-1">
        <TruckIcon className="size-4 text-foreground/70" />
        <span>{t("FAST_DISPATCH", { default: "Fast Dispatch" })}</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <RotateCcwIcon className="size-4 text-foreground/70" />
        <span>{t("EASY_RETURNS", { default: "Easy Returns" })}</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <ShieldCheckIcon className="size-4 text-foreground/70" />
        <span>{t("SECURE_CHECKOUT", { default: "Secure Checkout" })}</span>
      </div>
    </div>
  )
}