/**
 * @file components/dashboard/staff-access/staff-access-summary.tsx
 * @description Displays staff access statistics summary cards with animated numbers, visual color legends, and localization support.
 */

"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { UsersIcon, UserCheckIcon, UserXIcon } from "lucide-react"
import { AnimatedNumber } from "@/components/shared/animated-number"

interface StaffAccessSummaryProps {
  totalCount: number
  assignedCount: number
  unassignedCount: number
  totalLabel: string
  assignedLabel: string
  unassignedLabel: string
}

export function StaffAccessSummary({
  totalCount,
  assignedCount,
  unassignedCount,
  totalLabel,
  assignedLabel,
  unassignedLabel,
}: StaffAccessSummaryProps) {
  const t = useTranslations("StaffAccessManagement")

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {/* 1. بطاقة إجمالي الموظفين */}
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
          <span>{t("TOTAL_STAFF_LEGEND", { default: "All staff members" })}</span>
        </div>
      </div>

      {/* 2. بطاقة الموظفين ذوي الأدوار المسندة */}
      <div className="flex flex-col justify-between rounded-xl border border-border bg-card px-3 py-2.5 shadow-xs sm:px-4 sm:py-3">
        <div className="flex items-center justify-between">
          <div className="min-w-0 space-y-0.5 sm:space-y-1">
            <p className="truncate text-[10px] text-muted-foreground sm:text-xs">
              {assignedLabel}
            </p>
            <p className="text-base font-bold tabular-nums text-emerald-600 sm:text-xl dark:text-emerald-400">
              <AnimatedNumber value={assignedCount} />
            </p>
          </div>
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-secondary text-emerald-600 sm:size-8 dark:text-emerald-400">
            <UserCheckIcon className="size-3.5 sm:size-4" />
          </span>
        </div>
        {/* دليل الألوان للأدوار المسندة */}
        <div className="mt-3 flex items-center gap-1 border-t border-border/50 pt-2 text-[10px] text-muted-foreground">
          <span className="size-2 rounded-full bg-emerald-500" />
          <span>{t("STATUS_LEGEND_ASSIGNED", { default: "Roles Assigned" })}</span>
        </div>
      </div>

      {/* 3. بطاقة الموظفين بدون أدوار */}
      <div className="flex flex-col justify-between rounded-xl border border-border bg-card px-3 py-2.5 shadow-xs sm:px-4 sm:py-3">
        <div className="flex items-center justify-between">
          <div className="min-w-0 space-y-0.5 sm:space-y-1">
            <p className="truncate text-[10px] text-muted-foreground sm:text-xs">
              {unassignedLabel}
            </p>
            <p className="text-base font-bold tabular-nums text-amber-600 sm:text-xl dark:text-amber-400">
              <AnimatedNumber value={unassignedCount} />
            </p>
          </div>
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-secondary text-amber-600 sm:size-8 dark:text-amber-400">
            <UserXIcon className="size-3.5 sm:size-4" />
          </span>
        </div>
        {/* دليل الألوان لعدم وجود أدوار */}
        <div className="mt-3 flex items-center gap-1 border-t border-border/50 pt-2 text-[10px] text-muted-foreground">
          <span className="size-2 rounded-full bg-amber-500" />
          <span>{t("STATUS_LEGEND_UNASSIGNED", { default: "No Roles" })}</span>
        </div>
      </div>
    </div>
  )
}