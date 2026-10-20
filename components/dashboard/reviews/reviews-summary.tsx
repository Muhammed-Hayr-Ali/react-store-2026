/**
 * @file components/dashboard/reviews/reviews-summary.tsx
 * @description Displays review statistics summary cards with animated numbers and responsive layout.
 */

import * as React from "react"
import { MessageSquareIcon, CircleCheckIcon, ClockIcon } from "lucide-react"
import { AnimatedNumber } from "@/components/shared/animated-number"

interface ReviewsSummaryProps {
  totalCount: number
  approvedCount: number
  pendingCount: number
  totalLabel: string
  approvedLabel: string
  pendingLabel: string
}

export function ReviewsSummary({
  totalCount,
  approvedCount,
  pendingCount,
  totalLabel,
  approvedLabel,
  pendingLabel,
}: ReviewsSummaryProps) {
  return (
    // استخدام نفس الشبكة المتجاوبة: 3 أعمدة مع ضغط المسافات في الهواتف للحفاظ على التناسق
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      <SummaryCard
        icon={<MessageSquareIcon className="size-3.5 sm:size-4" />}
        label={totalLabel}
        value={totalCount}
      />
      <SummaryCard
        icon={<CircleCheckIcon className="size-3.5 sm:size-4" />}
        label={approvedLabel}
        value={approvedCount}
        accent="text-emerald-600 dark:text-emerald-400"
      />
      <SummaryCard
        icon={<ClockIcon className="size-3.5 sm:size-4" />}
        label={pendingLabel}
        value={pendingCount}
        accent="text-amber-600 dark:text-amber-400" // استخدام اللون البرتقالي/الكهرماني للتعليقات قيد الانتظار
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