"use client"

import * as React from "react"
import Link from "next/link"
import { useLocale } from "next-intl"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeftIcon, ChevronRightIcon, ZapIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ActiveFlashSale } from "@/lib/actions/flash-sales/types"
import type { CurrencyCode } from "@/lib/actions/currency/types"
import { FlashProductCard } from "./flash-product-card"
import { CountdownTimer } from "../home/countdown-timer"

interface FlashSaleSectionProps {
  sale: ActiveFlashSale
  currency: CurrencyCode
  exchangeRate: number
}

export function FlashSaleSection({
  sale,
  currency,
  exchangeRate,
}: FlashSaleSectionProps) {
  const locale = useLocale()
  const isRtl = locale === "ar"
  const [isVisible, setIsVisible] = React.useState(true)

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    direction: isRtl ? "rtl" : "ltr",
  })

  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)

  const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  React.useEffect(() => {
    if (!emblaApi) return

    const updateScrollButtons = () => {
      setCanScrollPrev(emblaApi.canScrollPrev())
      setCanScrollNext(emblaApi.canScrollNext())
    }

    emblaApi.on("select", updateScrollButtons)
    emblaApi.on("reInit", updateScrollButtons)
    updateScrollButtons()

    return () => {
      emblaApi.off("select", updateScrollButtons)
      emblaApi.off("reInit", updateScrollButtons)
    }
  }, [emblaApi])

  if (!isVisible || !sale.products || sale.products.length === 0) {
    return null
  }

  const title = isRtl && sale.title_ar ? sale.title_ar : sale.title

  const startStop = canScrollPrev ? "transparent 0%, black 28px" : "black 0%"
  const endStop = canScrollNext
    ? "black calc(100% - 28px), transparent 100%"
    : "black 100%"
  const maskStyle = `linear-gradient(to right, ${startStop}, ${endStop})`

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-2 sm:px-6 sm:py-2.5 lg:px-8">
      {/* إطار مضغوط وأنيق */}
      <div className="rounded-xl border border-destructive/20 bg-linear-to-b from-destructive/5 to-transparent p-2.5 sm:p-3.5">
        {/* ترويسة القسم على سطرين */}
        <div className="mb-2.5 space-y-2">
          {/* السطر الأول: العنوان وزر عرض الكل مع أزرار التمرير */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-destructive-foreground flex size-6 items-center justify-center rounded-md bg-destructive shadow-xs sm:size-7">
                <ZapIcon className="size-3.5 fill-current" />
              </span>
              <h2 className="text-sm font-bold tracking-tight text-foreground sm:text-base">
                {title}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <Button
                asChild
                variant="link"
                size="sm"
                className="h-auto p-0 text-[11px] font-semibold text-destructive hover:underline"
              >
                <Link href={`/${locale}/deals/${sale.slug}`}>
                  {isRtl ? "عرض الكل" : "View All"}
                </Link>
              </Button>

              <div className="flex items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={scrollPrev}
                  disabled={!canScrollPrev}
                  className="size-6.5 rounded-full text-muted-foreground hover:bg-muted disabled:opacity-20 sm:size-7"
                  aria-label="Previous flash products"
                >
                  {isRtl ? (
                    <ChevronRightIcon className="size-3.5" />
                  ) : (
                    <ChevronLeftIcon className="size-3.5" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={scrollNext}
                  disabled={!canScrollNext}
                  className="size-6.5 rounded-full text-muted-foreground hover:bg-muted disabled:opacity-20 sm:size-7"
                  aria-label="Next flash products"
                >
                  {isRtl ? (
                    <ChevronLeftIcon className="size-3.5" />
                  ) : (
                    <ChevronRightIcon className="size-3.5" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* السطر الثاني: عداد الوقت التنازلي */}
          <div className="flex items-center pt-0.5">
            <CountdownTimer
              targetDate={sale.ends_at}
              onExpire={() => setIsVisible(false)}
              labels={{
                days: isRtl ? "ي" : "d",
                hours: isRtl ? "س" : "h",
                minutes: isRtl ? "د" : "m",
                seconds: isRtl ? "ث" : "s",
              }}
            />
          </div>
        </div>

        {/* مسار التمرير (عرض عناصر أكثر مع نسب أضيق) */}
        <div
          className="overflow-hidden transition-all duration-300"
          ref={emblaRef}
          style={{
            maskImage: maskStyle,
            WebkitMaskImage: maskStyle,
          }}
        >
          <div className="flex gap-2 py-0.5 sm:gap-2.5">
            {sale.products.map((product) => (
              <div
                key={product.id}
                className="min-w-0 shrink-0 basis-[46%] sm:basis-[30%] md:basis-[22%] lg:basis-[18%]"
              >
                <FlashProductCard
                  product={product}
                  currency={currency}
                  exchangeRate={exchangeRate}
                  viewMode="grid"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
