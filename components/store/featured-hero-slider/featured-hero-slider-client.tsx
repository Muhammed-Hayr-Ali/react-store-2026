"use client"

/**
 * @file components/store/featured-hero-slider/featured-hero-slider-client.tsx
 * @description الغلاف التفاعلي لسلايدر المنتجات المميزة (Embla Carousel + التشغيل التلقائي).
 */

import * as React from "react"
import { useLocale, useTranslations } from "next-intl"
import useEmblaCarousel from "embla-carousel-react"

import { useCurrency } from "@/lib/context/currency-context"
import type { SimpliProduct } from "@/lib/actions/store/queries/get_filtered_products"
import type { ExchangeRateActionResponse } from "@/lib/actions/store/queries/get-exchange-rate"
import { AUTOPLAY_DELAY } from "./slider-utils"
import { FeaturedSlideItem } from "./featured-slide-item"
import { SliderExchangeBar } from "./slider-exchange-bar"

interface FeaturedHeroSliderClientProps {
  slides: SimpliProduct[]
  exchangeRate: ExchangeRateActionResponse | null
}

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)"

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION_QUERY)
  mq.addEventListener("change", onChange)
  return () => mq.removeEventListener("change", onChange)
}

function usePrefersReducedMotion() {
  return React.useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false
  )
}

export function FeaturedHeroSliderClient({
  slides,
  exchangeRate,
}: FeaturedHeroSliderClientProps) {
  const t = useTranslations("FeaturedHeroSlider")
  const locale = useLocale()
  const isRtl = locale === "ar"
  const count = slides.length
  const hasMultiple = count > 1

  // الأسعار مخزنة بسنتات الدولار، والسياق يتولى التحويل والتنسيق
  const { formatPrice } = useCurrency()

  /* --------------------------------- Embla ---------------------------------- */
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    direction: isRtl ? "rtl" : "ltr",
  })

  const [selectedIndex, setSelectedIndex] = React.useState(0)

  React.useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap())
    onSelect()
    emblaApi.on("select", onSelect).on("reInit", onSelect)
    return () => {
      emblaApi.off("select", onSelect).off("reInit", onSelect)
    }
  }, [emblaApi])

  /* ----------------------------- التشغيل التلقائي ---------------------------- */
  const reducedMotion = usePrefersReducedMotion()
  // null = لم يختر المستخدم بعد، فنتبع إعداد الجهاز
  const [userPaused, setUserPaused] = React.useState<boolean | null>(null)
  const isStopped = userPaused ?? reducedMotion

  const [isHovered, setIsHovered] = React.useState(false)
  const [hasFocus, setHasFocus] = React.useState(false)
  const [isDragging, setIsDragging] = React.useState(false)
  const [isOffscreen, setIsOffscreen] = React.useState(false)
  const [isTabHidden, setIsTabHidden] = React.useState(false)

  const isPaused =
    isStopped ||
    isHovered ||
    hasFocus ||
    isDragging ||
    isOffscreen ||
    isTabHidden

  const sectionRef = React.useRef<HTMLElement>(null)
  const progressRef = React.useRef<HTMLSpanElement>(null)
  const animationRef = React.useRef<Animation | null>(null)
  const isPausedRef = React.useRef(isPaused)

  React.useEffect(() => {
    if (!emblaApi) return
    const start = () => setIsDragging(true)
    const end = () => setIsDragging(false)
    emblaApi.on("pointerDown", start).on("pointerUp", end)
    return () => {
      emblaApi.off("pointerDown", start).off("pointerUp", end)
    }
  }, [emblaApi])

  React.useEffect(() => {
    const onVisibility = () => setIsTabHidden(document.hidden)
    onVisibility()
    document.addEventListener("visibilitychange", onVisibility)

    const el = sectionRef.current
    const observer = el
      ? new IntersectionObserver(
          ([entry]) => setIsOffscreen(!entry.isIntersecting),
          { threshold: 0.4 }
        )
      : null
    if (el) observer?.observe(el)

    return () => {
      document.removeEventListener("visibilitychange", onVisibility)
      observer?.disconnect()
    }
  }, [hasMultiple])

  // مؤشر التقدم هو المؤقت نفسه: عند اكتماله ننتقل للشريحة التالية
  React.useEffect(() => {
    const bar = progressRef.current
    if (!emblaApi || !bar || !hasMultiple) return

    const animation = bar.animate(
      [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }],
      { duration: AUTOPLAY_DELAY, fill: "forwards" }
    )
    animation.onfinish = () => emblaApi.scrollNext()
    if (isPausedRef.current) animation.pause()
    animationRef.current = animation

    return () => {
      animation.onfinish = null
      animation.cancel()
      animationRef.current = null
    }
  }, [emblaApi, selectedIndex, hasMultiple])

  React.useEffect(() => {
    isPausedRef.current = isPaused
    const animation = animationRef.current
    if (!animation || animation.playState === "finished") return
    if (isPaused) animation.pause()
    else animation.play()
  }, [isPaused])

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!emblaApi) return
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return
    event.preventDefault()
    const isForward = event.key === (isRtl ? "ArrowLeft" : "ArrowRight")
    if (isForward) emblaApi.scrollNext()
    else emblaApi.scrollPrev()
  }

  if (count === 0) return null

  return (
    <section
      ref={sectionRef}
      aria-roledescription="carousel"
      aria-label={t("region")}
      dir={isRtl ? "rtl" : "ltr"}
      onKeyDown={handleKeyDown}
      // الهوامش الجانبية مسؤولية الحاوية الأم
      className="w-full"
    >
      <div
        // الإيقاف المؤقت عند مرور الفأرة أو تركيز لوحة المفاتيح
        onPointerEnter={(e) => e.pointerType === "mouse" && setIsHovered(true)}
        onPointerLeave={() => setIsHovered(false)}
        onFocus={(e) => setHasFocus(e.target.matches(":focus-visible"))}
        onBlur={() => setHasFocus(false)}
        ref={emblaRef}
        aria-live={isStopped ? "polite" : "off"}
        className="overflow-hidden"
      >
        <div className="-ms-3 flex touch-pan-y">
          {slides.map((slide, index) => (
            <FeaturedSlideItem
              key={slide.id}
              slide={slide}
              index={index}
              total={count}
              isActive={index === selectedIndex}
              t={t}
              isRtl={isRtl}
              formatPrice={formatPrice}
            />
          ))}
        </div>
      </div>

      <SliderExchangeBar
        slides={slides}
        selectedIndex={selectedIndex}
        isStopped={isStopped}
        hasMultiple={hasMultiple}
        isRtl={isRtl}
        t={t}
        exchangeRate={exchangeRate}
        progressRef={progressRef}
        onTogglePlay={() => setUserPaused(!isStopped)}
        onPrev={() => emblaApi?.scrollPrev()}
        onNext={() => emblaApi?.scrollNext()}
        onSelect={(index) => emblaApi?.scrollTo(index)}
      />
    </section>
  )
}