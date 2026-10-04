"use client"

import * as React from "react"
import { TimerIcon, ZapIcon } from "lucide-react"

interface FlashSaleCountdownProps {
  endTime: string
  discountPercentage?: number | null
}

export function FlashSaleCountdown({
  endTime,
  discountPercentage,
}: FlashSaleCountdownProps) {
  const [timeLeft, setTimeLeft] = React.useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
    isEnded: boolean
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isEnded: false,
  })

  React.useEffect(() => {
    const calculateTime = () => {
      const difference = new Date(endTime).getTime() - new Date().getTime()

      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isEnded: true,
        })
        return
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isEnded: false,
      })
    }

    calculateTime()
    const timer = setInterval(calculateTime, 1000)
    return () => clearInterval(timer)
  }, [endTime])

  if (timeLeft.isEnded) return null

  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-destructive/25 bg-destructive/5 p-3.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2.5">
        <span className="text-destructive-foreground flex size-7.5 items-center justify-center rounded-lg bg-destructive shadow-xs">
          <ZapIcon className="size-4 fill-current" />
        </span>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-wider text-destructive uppercase">
              Flash Deal Active
            </span>
            {discountPercentage ? (
              <span className="text-destructive-foreground rounded-full bg-destructive px-2 py-0.5 text-[10px] font-extrabold">
                -{discountPercentage}%
              </span>
            ) : null}
          </div>
          <span className="text-[11px] text-muted-foreground">
            Special promotional price for a limited time
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 self-end sm:self-auto">
        <TimerIcon className="me-1 size-3.5 text-destructive" />
        <TimeBlock label="D" value={timeLeft.days} />
        <span className="font-bold text-destructive">:</span>
        <TimeBlock label="H" value={timeLeft.hours} />
        <span className="font-bold text-destructive">:</span>
        <TimeBlock label="M" value={timeLeft.minutes} />
        <span className="font-bold text-destructive">:</span>
        <TimeBlock label="S" value={timeLeft.seconds} />
      </div>
    </div>
  )
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  const formatted = String(value).padStart(2, "0")
  return (
    <span className="flex items-center gap-0.5 rounded-md border border-border/60 bg-background px-1.5 py-1 text-xs font-bold text-foreground tabular-nums shadow-xs">
      {formatted}
      <span className="text-[9px] font-normal text-muted-foreground">
        {label}
      </span>
    </span>
  )
}
