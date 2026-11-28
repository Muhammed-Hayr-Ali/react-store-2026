"use client"

/**
 * @file components/store/featured-hero-slider/slider-exchange-bar.tsx
 * @description شريط التحكم بالتنقل والتشغيل التلقائي مع عرض سعر الصرف أسفل السلايدر.
 */

import * as React from "react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  HelpCircleIcon,
  PauseIcon,
  PlayIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Link } from "@/i18n/navigation"
import type { SimpliProduct } from "@/lib/actions/store/queries/get_filtered_products"
import type { ExchangeRateActionResponse } from "@/lib/actions/store/queries/get-exchange-rate"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import {
  focusRing,
  formatRateNumber,
  formatRelativeUpdate,
  simpleControlClass,
  type SliderTranslations,
} from "./slider-utils"

interface SliderExchangeBarProps {
  slides: SimpliProduct[]
  selectedIndex: number
  isStopped: boolean
  hasMultiple: boolean
  isRtl: boolean
  t: SliderTranslations
  exchangeRate: ExchangeRateActionResponse | null
  progressRef: React.RefObject<HTMLSpanElement | null>
  onTogglePlay: () => void
  onPrev: () => void
  onNext: () => void
  onSelect: (index: number) => void
}

export function SliderExchangeBar({
  slides,
  selectedIndex,
  isStopped,
  hasMultiple,
  isRtl,
  t,
  exchangeRate,
  progressRef,
  onTogglePlay,
  onPrev,
  onNext,
  onSelect,
}: SliderExchangeBarProps) {
  const PrevIcon = isRtl ? ChevronRightIcon : ChevronLeftIcon
  const NextIcon = isRtl ? ChevronLeftIcon : ChevronRightIcon

  const hasValidRate = Boolean(exchangeRate?.ok && exchangeRate.rate)
  const rateRow = hasValidRate ? exchangeRate!.rate! : null
  const updatedLabel = rateRow
    ? formatRelativeUpdate(
        rateRow.source_updated_at ??
          rateRow.updated_at ??
          exchangeRate?.sourceUpdatedAt,
        isRtl,
        t
      )
    : null

  if (!hasMultiple && !rateRow) return null

  const renderPlayPauseButton = () => (
    <button
      type="button"
      onClick={onTogglePlay}
      aria-label={isStopped ? t("play") : t("pause")}
      className={simpleControlClass}
    >
      {isStopped ? (
        <PlayIcon aria-hidden="true" className="size-3.5" />
      ) : (
        <PauseIcon aria-hidden="true" className="size-3.5" />
      )}
    </button>
  )

  const renderPrevNextWithDots = () => (
    <div className="flex items-center gap-0.5 sm:gap-1">
      <button
        type="button"
        onClick={onPrev}
        aria-label={t("prev")}
        className={simpleControlClass}
      >
        <PrevIcon aria-hidden="true" className="size-4" />
      </button>

      <div className="flex items-center">
        {slides.map((slide, index) => {
          const isSelected = index === selectedIndex

          return (
            <button
              key={slide.id}
              type="button"
              onClick={() => onSelect(index)}
              aria-label={t("goTo", { index: index + 1 })}
              aria-current={isSelected ? "true" : undefined}
              className={cn(
                "group/dot flex h-6 min-w-6 items-center justify-center rounded-full px-0.5",
                focusRing
              )}
            >
              <span
                className={cn(
                  "relative block h-1.5 overflow-hidden rounded-full transition-[width,background-color] duration-300",
                  isSelected
                    ? "w-7 bg-primary/20"
                    : "w-1.5 bg-foreground/20 group-hover/dot:bg-foreground/40"
                )}
              >
                {isSelected && (
                  <span
                    ref={progressRef}
                    className="absolute inset-0 origin-left rounded-full bg-primary rtl:origin-right"
                  />
                )}
              </span>
            </button>
          )
        })}
      </div>

      <button
        type="button"
        onClick={onNext}
        aria-label={t("next")}
        className={simpleControlClass}
      >
        <NextIcon aria-hidden="true" className="size-4" />
      </button>
    </div>
  )

  const renderSourceHoverCard = () => (
    <HoverCard openDelay={10} closeDelay={100}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          aria-label={t("sourceInfoAriaLabel")}
          className={cn(
            "inline-flex size-4 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground",
            focusRing
          )}
        >
          <HelpCircleIcon aria-hidden="true" className="size-3.5" />
        </button>
      </HoverCardTrigger>
      <HoverCardContent
        align="end"
        className="w-fit text-start text-xs leading-relaxed text-muted-foreground"
      >
        <p>
          {t("sourceDisclaimerPrefix")}{" "}
          <Link
            href="https://sp-today.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground hover:text-primary"
          >
            {t("sourceSiteName")}
          </Link>
        </p>
      </HoverCardContent>
    </HoverCard>
  )

  return (
    <div className="mt-3">
      {/* الشاشات الكبيرة: صف واحد */}
      <div className="hidden items-center justify-between gap-3 sm:flex">
        {hasMultiple && (
          <div className="flex items-center gap-1">
            {renderPlayPauseButton()}
            {renderPrevNextWithDots()}
          </div>
        )}

        {rateRow && (
          <div className="ms-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            <span className="text-foreground">{t("currencyPair")}</span>

            <span className="text-muted-foreground">
              {t("buy")}{" "}
              <bdi className="text-foreground tabular-nums">
                {formatRateNumber(rateRow.raw_buy)}
              </bdi>
            </span>

            <span className="text-muted-foreground">
              {t("sell")}{" "}
              <bdi className="font-semibold text-foreground tabular-nums">
                {formatRateNumber(rateRow.raw_sell)}
              </bdi>
            </span>

            {updatedLabel && (
              <span className="text-muted-foreground">{updatedLabel}</span>
            )}

            {renderSourceHoverCard()}
          </div>
        )}
      </div>

      {/* الشاشات الصغيرة: تحكم، خط، سعر الصرف، خط، آخر تحديث وإشارة الاستفهام، ثم خط */}
      <div className="flex flex-col sm:hidden">
        {hasMultiple && (
          <div className="flex items-center justify-between">
            {renderPlayPauseButton()}
            {renderPrevNextWithDots()}
            <span aria-hidden="true" className="size-7 shrink-0" />
          </div>
        )}

        {hasMultiple && rateRow && <hr className="my-2.5 border-border/60" />}

        {rateRow && (
          <div className="flex flex-col gap-1 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="text-foreground">{t("currencyPair")}</span>

              <div className="flex items-center gap-3">
                <span className="text-muted-foreground">
                  {t("buy")}{" "}
                  <bdi className="text-foreground tabular-nums">
                    {formatRateNumber(rateRow.raw_buy)}
                  </bdi>
                </span>

                <span className="text-muted-foreground">
                  {t("sell")}{" "}
                  <bdi className="font-semibold text-foreground tabular-nums">
                    {formatRateNumber(rateRow.raw_sell)}
                  </bdi>
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">
                {updatedLabel ?? ""}
              </span>
              {renderSourceHoverCard()}
            </div>

            <hr className="my-2.5 border-border/60" />
          </div>
        )}
      </div>
    </div>
  )
}