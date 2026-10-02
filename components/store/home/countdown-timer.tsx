"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
  isExpired: boolean
}

interface CountdownTimerProps {
  targetDate: string
  className?: string
  onExpire?: () => void
  labels?: {
    days?: string
    hours?: string
    minutes?: string
    seconds?: string
  }
}

function calculateTimeLeft(targetIso: string): TimeLeft {
  const difference = new Date(targetIso).getTime() - Date.now()

  if (difference <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
    }
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    isExpired: false,
  }
}

function padZero(value: number): string {
  return value.toString().padStart(2, "0")
}

// دالة الاشتراك في عداد الثواني (External Store Subscription)
function subscribeToClock(callback: () => void) {
  const interval = setInterval(callback, 1000)
  return () => clearInterval(interval)
}

export function CountdownTimer({
  targetDate,
  className,
  onExpire,
  labels = {
    days: "d",
    hours: "h",
    minutes: "m",
    seconds: "s",
  },
}: CountdownTimerProps) {
  // قراءة الوقت متزامناً على جانب العميل بدون useState أو useEffect
  // وإرجاع null على السيرفر لتفادي Hydration Mismatch تماماً
  const now = React.useSyncExternalStore(
    subscribeToClock,
    () => Date.now(),
    () => null
  )

  // إذا كنا في مرحلة SSR أو اللحظة الأولى للعميل قبل استقرار الـ Store
  if (now === null) {
    return (
      <div className={cn("flex items-center gap-1 sm:gap-1.5", className)}>
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex h-7 w-8 animate-pulse items-center justify-center rounded-md bg-muted/60 sm:h-8 sm:w-9"
          />
        ))}
      </div>
    )
  }

  const timeLeft = calculateTimeLeft(targetDate)

  if (timeLeft.isExpired) {
    onExpire?.()
    return null
  }

  const timeUnits: Array<{ value: number; label: string }> = [
    ...(timeLeft.days > 0
      ? [{ value: timeLeft.days, label: labels.days || "d" }]
      : []),
    { value: timeLeft.hours, label: labels.hours || "h" },
    { value: timeLeft.minutes, label: labels.minutes || "m" },
    { value: timeLeft.seconds, label: labels.seconds || "s" },
  ]

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 font-mono sm:gap-1.5",
        className
      )}
      aria-label="Flash sale countdown timer"
    >
      {timeUnits.map((unit, index) => (
        <React.Fragment key={unit.label}>
          <div className="flex flex-col items-center">
            <div className="flex h-7 min-w-7 items-center justify-center rounded-md bg-foreground px-1 text-xs font-bold text-background shadow-xs sm:h-8 sm:min-w-8 sm:text-sm">
              <span className="tabular-nums">{padZero(unit.value)}</span>
            </div>
            <span className="mt-0.5 font-sans text-[9px] leading-none text-muted-foreground uppercase">
              {unit.label}
            </span>
          </div>

          {index < timeUnits.length - 1 && (
            <span className="mb-2.5 text-xs font-bold text-muted-foreground select-none">
              :
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  )
}
