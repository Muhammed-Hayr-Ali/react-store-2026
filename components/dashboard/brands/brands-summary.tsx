/**
 * @file components/dashboard/brands/brands-summary.tsx
 * @description Displays brand statistics summary cards with animated numbers and responsive layout.
 */

import * as React from "react"
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
  return (
    // استخدام شبكة متجاوبة: عمودين في الهواتف الصغيرة جداً لتقليل الطول، أو 3 أعمدة أفقية بمسافات مضغوطة
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      <SummaryCard
        icon={<TagsIcon className="size-3.5 sm:size-4" />}
        label={totalLabel}
        value={totalCount}
      />
      <SummaryCard
        icon={<CircleCheckIcon className="size-3.5 sm:size-4" />}
        label={activeLabel}
        value={activeCount}
        accent="text-emerald-600 dark:text-emerald-400"
      />
      <SummaryCard
        icon={<CircleAlertIcon className="size-3.5 sm:size-4" />}
        label={inactiveLabel}
        value={inactiveCount}
        accent="text-amber-600 dark:text-amber-400"
      />
    </div>
  )
}

function SummaryCard({
  icon,
  label,
  value,
  accent = "text-foreground",
}: {
  icon: React.ReactNode
  label: string
  value: number
  accent?: string
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2.5 sm:px-4 sm:py-3 shadow-xs">
      <div className="space-y-0.5 sm:space-y-1 min-w-0">
        <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{label}</p>
        <p className={`text-base sm:text-xl font-bold tabular-nums ${accent}`}>
          <AnimatedNumber value={value} />
        </p>
      </div>
      <span
        className={`flex size-7 sm:size-8 shrink-0 items-center justify-center rounded-lg bg-secondary ${accent}`}
      >
        {icon}
      </span>
    </div>
  )
}