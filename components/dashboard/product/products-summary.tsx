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
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      <div className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2.5 shadow-xs sm:px-4 sm:py-3">
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

      <div className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2.5 shadow-xs sm:px-4 sm:py-3">
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

      <div className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2.5 shadow-xs sm:px-4 sm:py-3">
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
    </div>
  )
}
