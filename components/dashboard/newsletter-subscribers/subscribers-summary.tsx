/**
 * @file components/dashboard/newsletter/subscribers-summary.tsx
 * @description Displays newsletter subscribers statistics summary cards with animated numbers.
 */

import * as React from "react"
import { UsersIcon, UserRoundCheckIcon, XIcon } from "lucide-react"
import { AnimatedNumber } from "@/components/shared/animated-number"

interface SubscribersSummaryProps {
  totalCount: number
  activeCount: number
  unsubscribedCount: number
  totalLabel: string
  activeLabel: string
  unsubscribedLabel: string
}

export function SubscribersSummary({
  totalCount,
  activeCount,
  unsubscribedCount,
  totalLabel,
  activeLabel,
  unsubscribedLabel,
}: SubscribersSummaryProps) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      <SummaryCard
        icon={<UsersIcon className="size-3.5 sm:size-4" />}
        label={totalLabel}
        value={totalCount}
      />
      <SummaryCard
        icon={<UserRoundCheckIcon className="size-3.5 sm:size-4" />}
        label={activeLabel}
        value={activeCount}
        accent="text-emerald-600 dark:text-emerald-400"
      />
      <SummaryCard
        icon={<XIcon className="size-3.5 sm:size-4" />}
        label={unsubscribedLabel}
        value={unsubscribedCount}
        accent="text-muted-foreground"
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