/**
 * @file components/dashboard/brands/brands-summary.tsx
 * @description Displays brand statistics summary cards with animated numbers, visual color legends, and localization support.
 */

"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { TagsIcon, CircleCheckIcon, CircleAlertIcon } from "lucide-react"
import { AnimatedNumber } from "@/components/shared/animated-number"

interface BrandsSummaryProps {
  totalCount: number
  activeCount: number
  inactiveCount: number
  totalLabel: string
  activeLabel: string
  inactiveLabel: string
}

export function BrandsSummary({
  totalCount,
  activeCount,
  inactiveCount,
  totalLabel,
  activeLabel,
  inactiveLabel,
}: BrandsSummaryProps) {
  const t = useTranslations("BrandsManagement")

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {/* 1. بطاقة إجمالي العلامات التجارية */}
      <div className="flex flex-col justify-between rounded-xl border border-border bg-card px-3 py-2.5 shadow-xs sm:px-4 sm:py-3">
        <div className="flex items-center justify-between">
          <div className="min-w-0 space-y-0.5 sm:space-y-1">
            <p className="truncate text-[10px] text-muted-foreground sm:text-xs">
              {totalLabel}
            </p>
            <p className="text-base font-bold tabular-nums text-foreground sm:text-xl">
              <AnimatedNumber value={totalCount} />
            </p>
          </div>
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-secondary text-foreground sm:size-8">
            <TagsIcon className="size-3.5 sm:size-4" />
          </span>
        </div>
        <div className="mt-3 flex items-center gap-1 border-t border-border/50 pt-2 text-[10px] text-muted-foreground">
          <span className="size-2 rounded-full bg-muted-foreground/60" />
          <span>{t("TOTAL_BRANDS_LEGEND", { default: "All registered brands" })}</span>
        </div>
      </div>

      {/* 2. بطاقة العلامات التجارية النشطة */}
      <div className="flex flex-col justify-between rounded-xl border border-border bg-card px-3 py-2.5 shadow-xs sm:px-4 sm:py-3">
        <div className="flex items-center justify-between">
          <div className="min-w-0 space-y-0.5 sm:space-y-1">
            <p className="truncate text-[10px] text-muted-foreground sm:text-xs">
              {activeLabel}
            </p>
            <p className="text-base font-bold tabular-nums text-emerald-600 sm:text-xl dark:text-emerald-400">
              <AnimatedNumber value={activeCount} />
            </p>
          </div>
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-secondary text-emerald-600 sm:size-8 dark:text-emerald-400">
            <CircleCheckIcon className="size-3.5 sm:size-4" />
          </span>
        </div>
        {/* دليل الألوان للحالة النشطة */}
        <div className="mt-3 flex items-center gap-1 border-t border-border/50 pt-2 text-[10px] text-muted-foreground">
          <span className="size-2 rounded-full bg-emerald-500" />
          <span>{t("STATUS_LEGEND_ACTIVE", { default: "Active" })}</span>
        </div>
      </div>

      {/* 3. بطاقة العلامات التجارية غير النشطة */}
      <div className="flex flex-col justify-between rounded-xl border border-border bg-card px-3 py-2.5 shadow-xs sm:px-4 sm:py-3">
        <div className="flex items-center justify-between">
          <div className="min-w-0 space-y-0.5 sm:space-y-1">
            <p className="truncate text-[10px] text-muted-foreground sm:text-xs">
              {inactiveLabel}
            </p>
            <p className="text-base font-bold tabular-nums text-amber-600 sm:text-xl dark:text-amber-400">
              <AnimatedNumber value={inactiveCount} />
            </p>
          </div>
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-secondary text-amber-600 sm:size-8 dark:text-amber-400">
            <CircleAlertIcon className="size-3.5 sm:size-4" />
          </span>
        </div>
        {/* دليل الألوان للحالة غير النشطة */}
        <div className="mt-3 flex items-center gap-1 border-t border-border/50 pt-2 text-[10px] text-muted-foreground">
          <span className="size-2 rounded-full bg-amber-500" />
          <span>{t("STATUS_LEGEND_INACTIVE", { default: "Inactive" })}</span>
        </div>
      </div>
    </div>
  )
}