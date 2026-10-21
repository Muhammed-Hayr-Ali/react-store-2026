/**
 * @file components/dashboard/product/products-summary.tsx
 * @description Dashboard products summary component with visual color legend matching table thresholds and localization support.
 */

"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import {
  CalendarClockIcon,
  CircleAlertIcon,
  CircleCheckIcon,
} from "lucide-react"
import { AnimatedNumber } from "@/components/shared/animated-number"

interface ProductsSummaryProps {
  activeCount: number
  lowStockCount: number
  expiringSoonCount: number
  activeLabel: string
  lowStockLabel: string
  expiringSoonLabel: string
}

export function ProductsSummary({
  activeCount,
  lowStockCount,
  expiringSoonCount,
  activeLabel,
  lowStockLabel,
  expiringSoonLabel,
}: ProductsSummaryProps) {
  const t = useTranslations("ProductsManagement")

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {/* 1. بطاقة المنتجات النشطة / الحالة (Status Legend) */}
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
        {/* دليل الألوان لـ Status */}
        <div className="mt-3 flex items-center gap-3 border-t border-border/50 pt-2 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-emerald-500" />
            <span>{t("STATUS_LEGEND_ACTIVE")}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-amber-500" />
            <span>{t("STATUS_LEGEND_INACTIVE")}</span>
          </div>
        </div>
      </div>

      {/* 2. بطاقة تواريخ الصلاحية القريبة (Expiration Date Legend) */}
      <div className="flex flex-col justify-between rounded-xl border border-border bg-card px-3 py-2.5 shadow-xs sm:px-4 sm:py-3">
        <div className="flex items-center justify-between">
          <div className="min-w-0 space-y-0.5 sm:space-y-1">
            <p className="truncate text-[10px] text-muted-foreground sm:text-xs">
              {expiringSoonLabel}
            </p>
            <p className="text-base font-bold tabular-nums text-orange-600 sm:text-xl dark:text-orange-400">
              <AnimatedNumber value={expiringSoonCount} />
            </p>
          </div>
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-secondary text-orange-600 sm:size-8 dark:text-orange-400">
            <CalendarClockIcon className="size-3.5 sm:size-4" />
          </span>
        </div>
        {/* دليل الألوان لـ Expiration Date */}
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/50 pt-2 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-destructive" />
            <span>{t("EXP_EXPIRED")}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-red-500" />
            <span>{t("EXP_SEVEN_DAYS")}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-orange-500" />
            <span>{t("EXP_THIRTY_DAYS")}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-amber-500" />
            <span>{t("EXP_NINETY_DAYS")}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-emerald-500" />
            <span>{t("EXP_SAFE")}</span>
          </div>
        </div>
      </div>

      {/* 3. بطاقة المخزون المنخفض (Stock Legend) */}
      <div className="flex flex-col justify-between rounded-xl border border-border bg-card px-3 py-2.5 shadow-xs sm:px-4 sm:py-3">
        <div className="flex items-center justify-between">
          <div className="min-w-0 space-y-0.5 sm:space-y-1">
            <p className="truncate text-[10px] text-muted-foreground sm:text-xs">
              {lowStockLabel}
            </p>
            <p className="text-base font-bold tabular-nums text-amber-600 sm:text-xl dark:text-amber-400">
              <AnimatedNumber value={lowStockCount} />
            </p>
          </div>
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-secondary text-amber-600 sm:size-8 dark:text-amber-400">
            <CircleAlertIcon className="size-3.5 sm:size-4" />
          </span>
        </div>
        {/* دليل الألوان لـ Stock */}
        <div className="mt-3 flex items-center gap-3 border-t border-border/50 pt-2 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-amber-500" />
            <span>{t("STOCK_LOW")}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-emerald-500" />
            <span>{t("STOCK_NORMAL")}</span>
          </div>
        </div>
      </div>
    </div>
  )
}