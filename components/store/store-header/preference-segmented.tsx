"use client"

import * as React from "react"
import { Loader2Icon } from "lucide-react"

import { cn } from "@/lib/utils"
import { focusRing } from "./store-header-shared"

export interface SegmentedOption {
  value: string
  label: string
  icon?: React.ReactNode
  lang?: string
}

interface PreferenceSegmentedProps {
  ariaLabel: string
  value: string
  options: SegmentedOption[]
  onSelect: (value: string) => void
  isPending: boolean
  loadingValue: string | null
  /** إخفاء النص تحت xl مع إبقائه لقارئات الشاشة */
  collapseLabels?: boolean
}

/**
 * مجموعة أزرار بدل Tabs: لا يتغير الاختيار إلا بالضغط (Enter / Space / نقرة)،
 * ولا توجد إشارة aria-controls إلى لوحات غير موجودة.
 */
export function PreferenceSegmented({
  ariaLabel,
  value,
  options,
  onSelect,
  isPending,
  loadingValue,
  collapseLabels = false,
}: PreferenceSegmentedProps) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      aria-busy={isPending}
      className="inline-flex h-8 items-center rounded-xl bg-muted/60 p-0.5"
    >
      {options.map((option) => {
        const isSelected = option.value === value

        return (
          <button
            key={option.value}
            type="button"
            lang={option.lang}
            title={collapseLabels ? option.label : undefined}
            aria-pressed={isSelected}
            // aria-disabled بدل disabled حتى لا يضيع التركيز أثناء التحميل
            aria-disabled={isPending || undefined}
            onClick={() => onSelect(option.value)}
            className={cn(
              "inline-flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium whitespace-nowrap transition-all aria-disabled:cursor-wait aria-disabled:opacity-70",
              isSelected
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground",
              focusRing
            )}
          >
            {loadingValue === option.value ? (
              <Loader2Icon
                aria-hidden="true"
                className="size-3 animate-spin text-primary"
              />
            ) : (
              option.icon
            )}
            <span className={cn(collapseLabels && "sr-only xl:not-sr-only")}>
              {option.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
