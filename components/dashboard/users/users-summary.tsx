/**
 * @file components/dashboard/users/users-summary.tsx
 * @description Displays user statistics summary cards with animated numbers, visual color legends, and localization support.
 */

"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { UsersIcon, UserCheckIcon, UserXIcon } from "lucide-react"
import { AnimatedNumber } from "@/components/shared/animated-number"

interface UsersSummaryProps {
  totalCount: number
  activeCount: number
  bannedCount: number
  totalLabel: string
  activeLabel: string
  bannedLabel: string
}

export function UsersSummary({
  totalCount,
  activeCount,
  bannedCount,
  totalLabel,
  activeLabel,
  bannedLabel,
}: UsersSummaryProps) {
  const t = useTranslations("UsersManagement")

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {/* 1. بطاقة إجمالي المستخدمين */}
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
            <UsersIcon className="size-3.5 sm:size-4" />
          </span>
        </div>
        <div className="mt-3 flex items-center gap-1 border-t border-border/50 pt-2 text-[10px] text-muted-foreground">
          <span className="size-2 rounded-full bg-muted-foreground/60" />
          <span>{t("TOTAL_USERS_LEGEND", { default: "All registered accounts" })}</span>
        </div>
      </div>

      {/* 2. بطاقة المستخدمين النشطين */}
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
            <UserCheckIcon className="size-3.5 sm:size-4" />
          </span>
        </div>
        {/* دليل الألوان للحالة النشطة */}
        <div className="mt-3 flex items-center gap-3 border-t border-border/50 pt-2 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-emerald-500" />
            <span>{t("STATUS_LEGEND_ACTIVE", { default: "Active" })}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-amber-500" />
            <span>{t("STATUS_LEGEND_SUSPENDED", { default: "Suspended" })}</span>
          </div>
        </div>
      </div>

      {/* 3. بطاقة المستخدمين المحظورين */}
      <div className="flex flex-col justify-between rounded-xl border border-border bg-card px-3 py-2.5 shadow-xs sm:px-4 sm:py-3">
        <div className="flex items-center justify-between">
          <div className="min-w-0 space-y-0.5 sm:space-y-1">
            <p className="truncate text-[10px] text-muted-foreground sm:text-xs">
              {bannedLabel}
            </p>
            <p className="text-base font-bold tabular-nums text-destructive sm:text-xl">
              <AnimatedNumber value={bannedCount} />
            </p>
          </div>
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-secondary text-destructive sm:size-8">
            <UserXIcon className="size-3.5 sm:size-4" />
          </span>
        </div>
        {/* دليل الألوان لحالة الحظر */}
        <div className="mt-3 flex items-center gap-1 border-t border-border/50 pt-2 text-[10px] text-muted-foreground">
          <span className="size-2 rounded-full bg-destructive" />
          <span>{t("STATUS_LEGEND_BANNED", { default: "Banned" })}</span>
        </div>
      </div>
    </div>
  )
}