/**
 * @file components/dashboard/newsletter/subscribers-summary.tsx
 * @description Displays newsletter subscribers statistics summary cards with animated numbers, visual color legends, and localization support.
 */

"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { UsersIcon, UserRoundCheckIcon, XIcon } from "lucide-react"
import { AnimatedNumber } from "@/components/shared/animated-number"

interface SubscribersSummaryProps {
  totalCount: number
  activeCount: number
  unsubscribedCount: number
}

export function SubscribersSummary({
  totalCount,
  activeCount,
  unsubscribedCount,
}: SubscribersSummaryProps) {
  const t = useTranslations("NewsletterSubscribersManagement")

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {/* 1. بطاقة إجمالي المشتركين */}
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
            <UsersIcon className="size-3.5 sm:size-4" />
          </span>
        </div>
        <div className="mt-3 flex items-center gap-1 border-t border-border/50 pt-2 text-[10px] text-muted-foreground">
          <span className="size-2 rounded-full bg-muted-foreground/60" />
          <span>
            {t("TOTAL_SUBSCRIBERS_LEGEND", {
              default: "All newsletter subscribers",
            })}
          </span>
        </div>
      </div>

      {/* 2. بطاقة المشتركين النشطين */}
      <div className="flex flex-col justify-between rounded-xl border border-border bg-card px-3 py-2.5 shadow-xs sm:px-4 sm:py-3">
        <div className="flex items-center justify-between">
          <div className="min-w-0 space-y-0.5 sm:space-y-1">
            <p className="truncate text-[10px] text-muted-foreground sm:text-xs">
              {t("ACTIVE_COUNT")}
            </p>
            <p className="text-base font-bold text-emerald-600 tabular-nums sm:text-xl dark:text-emerald-400">
              <AnimatedNumber value={activeCount} />
            </p>
          </div>
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-secondary text-emerald-600 sm:size-8 dark:text-emerald-400">
            <UserRoundCheckIcon className="size-3.5 sm:size-4" />
          </span>
        </div>
        {/* دليل الألوان للحالة النشطة */}
        <div className="mt-3 flex items-center gap-1 border-t border-border/50 pt-2 text-[10px] text-muted-foreground">
          <span className="size-2 rounded-full bg-emerald-500" />
          <span>{t("STATUS_LEGEND_ACTIVE", { default: "Active" })}</span>
        </div>
      </div>

      {/* 3. بطاقة المشتركين الملغيين */}
      <div className="flex flex-col justify-between rounded-xl border border-border bg-card px-3 py-2.5 shadow-xs sm:px-4 sm:py-3">
        <div className="flex items-center justify-between">
          <div className="min-w-0 space-y-0.5 sm:space-y-1">
            <p className="truncate text-[10px] text-muted-foreground sm:text-xs">
              {t("UNSUBSCRIBED_COUNT")}
            </p>
            <p className="text-base font-bold text-muted-foreground tabular-nums sm:text-xl">
              <AnimatedNumber value={unsubscribedCount} />
            </p>
          </div>
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground sm:size-8">
            <XIcon className="size-3.5 sm:size-4" />
          </span>
        </div>
        {/* دليل الألوان لحالة إلغاء الاشتراك */}
        <div className="mt-3 flex items-center gap-1 border-t border-border/50 pt-2 text-[10px] text-muted-foreground">
          <span className="size-2 rounded-full bg-muted-foreground" />
          <span>
            {t("STATUS_LEGEND_UNSUBSCRIBED", { default: "Unsubscribed" })}
          </span>
        </div>
      </div>
    </div>
  )
}
