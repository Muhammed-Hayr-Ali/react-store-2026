/**
 * @file components/dashboard/reviews/reviews-summary.tsx
 * @description Displays review statistics summary cards with animated numbers, visual color legends, and localization support.
 */

"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { MessageSquareIcon, CircleCheckIcon, ClockIcon } from "lucide-react"
import { AnimatedNumber } from "@/components/shared/animated-number"

interface ReviewsSummaryProps {
  totalCount: number
  approvedCount: number
  pendingCount: number
}

export function ReviewsSummary({
  totalCount,
  approvedCount,
  pendingCount,
}: ReviewsSummaryProps) {
  const t = useTranslations("ReviewsManagement")

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {/* 1. بطاقة إجمالي التقييمات */}
      <div className="flex flex-col justify-between rounded-xl border border-border bg-card px-3 py-2.5 shadow-xs sm:px-4 sm:py-3">
        <div className="flex items-center justify-between">
          <div className="min-w-0 space-y-0.5 sm:space-y-1">
            <p className="truncate text-[10px] text-muted-foreground sm:text-xs">
              {t("TOTAL_COUNT")}
            </p>
            <p className="text-base font-bold text-foreground tabular-nums sm:text-xl">
              <AnimatedNumber value={totalCount} />
            </p>
          </div>
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-secondary text-foreground sm:size-8">
            <MessageSquareIcon className="size-3.5 sm:size-4" />
          </span>
        </div>
        <div className="mt-3 flex items-center gap-1 border-t border-border/50 pt-2 text-[10px] text-muted-foreground">
          <span className="size-2 rounded-full bg-muted-foreground/60" />
          <span>
            {t("TOTAL_REVIEWS_LEGEND", { default: "All submitted reviews" })}
          </span>
        </div>
      </div>

      {/* 2. بطاقة التقييمات المقبولة */}
      <div className="flex flex-col justify-between rounded-xl border border-border bg-card px-3 py-2.5 shadow-xs sm:px-4 sm:py-3">
        <div className="flex items-center justify-between">
          <div className="min-w-0 space-y-0.5 sm:space-y-1">
            <p className="truncate text-[10px] text-muted-foreground sm:text-xs">
              {t("APPROVED_COUNT")}
            </p>
            <p className="text-base font-bold text-emerald-600 tabular-nums sm:text-xl dark:text-emerald-400">
              <AnimatedNumber value={approvedCount} />
            </p>
          </div>
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-secondary text-emerald-600 sm:size-8 dark:text-emerald-400">
            <CircleCheckIcon className="size-3.5 sm:size-4" />
          </span>
        </div>
        {/* دليل الألوان للتقييمات المقبولة */}
        <div className="mt-3 flex items-center gap-1 border-t border-border/50 pt-2 text-[10px] text-muted-foreground">
          <span className="size-2 rounded-full bg-emerald-500" />
          <span>{t("STATUS_LEGEND_APPROVED")}</span>
        </div>
      </div>

      {/* 3. بطاقة التقييمات قيد الانتظار */}
      <div className="flex flex-col justify-between rounded-xl border border-border bg-card px-3 py-2.5 shadow-xs sm:px-4 sm:py-3">
        <div className="flex items-center justify-between">
          <div className="min-w-0 space-y-0.5 sm:space-y-1">
            <p className="truncate text-[10px] text-muted-foreground sm:text-xs">
              {t("PENDING_COUNT")}
            </p>
            <p className="text-base font-bold text-amber-600 tabular-nums sm:text-xl dark:text-amber-400">
              <AnimatedNumber value={pendingCount} />
            </p>
          </div>
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-secondary text-amber-600 sm:size-8 dark:text-amber-400">
            <ClockIcon className="size-3.5 sm:size-4" />
          </span>
        </div>
        {/* دليل الألوان للتقييمات قيد الانتظار */}
        <div className="mt-3 flex items-center gap-1 border-t border-border/50 pt-2 text-[10px] text-muted-foreground">
          <span className="size-2 rounded-full bg-amber-500" />
          <span>{t("STATUS_LEGEND_PENDING", { default: "Pending" })}</span>
        </div>
      </div>
    </div>
  )
}
