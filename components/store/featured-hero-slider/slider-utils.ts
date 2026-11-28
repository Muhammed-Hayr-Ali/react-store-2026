/**
 * @file components/store/featured-hero-slider/slider-utils.ts
 * @description ثوابت ودوال مساعدة لتنسيق سعر الصرف والوقت النسبي والحركة في سلايدر المنتجات المميزة.
 */

import type { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

export type SliderTranslations = ReturnType<
  typeof useTranslations<"FeaturedHeroSlider">
>

export const AUTOPLAY_DELAY = 6000

export const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"

export const simpleControlClass = cn(
  "flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground active:scale-95",
  focusRing
)

/** ظهور متدرج لعناصر الشريحة النشطة */
export const revealClass = (isActive: boolean) =>
  cn(
    "transition-[translate,opacity] duration-500 ease-out motion-reduce:transition-none",
    isActive
      ? "translate-y-0 opacity-100"
      : "opacity-0 motion-safe:translate-y-3"
  )

export function formatRelativeUpdate(
  dateString: string | null | undefined,
  isRtl: boolean,
  t: SliderTranslations
): string | null {
  if (!dateString) return null
  const timestamp = Date.parse(dateString)
  if (Number.isNaN(timestamp)) return null

  const diffSeconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000))
  const rtf = new Intl.RelativeTimeFormat(isRtl ? "ar" : "en", {
    numeric: "auto",
  })

  let formattedRelative: string
  if (diffSeconds < 60) {
    formattedRelative = rtf.format(-diffSeconds, "second")
  } else if (diffSeconds < 3600) {
    formattedRelative = rtf.format(-Math.floor(diffSeconds / 60), "minute")
  } else if (diffSeconds < 86400) {
    formattedRelative = rtf.format(-Math.floor(diffSeconds / 3600), "hour")
  } else {
    formattedRelative = rtf.format(-Math.floor(diffSeconds / 86400), "day")
  }

  return t("lastUpdatedAgo", { time: formattedRelative })
}

export function formatRateNumber(value: number): string {
  return Number(value).toFixed(2)
}
