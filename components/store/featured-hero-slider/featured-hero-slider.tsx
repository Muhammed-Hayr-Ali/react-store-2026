"use client"

/**
 * @file components/store/featured-hero-slider.tsx
 * @description سلايدر المنتجات المميزة: بطاقة بقسمين (معلومات + صورة)،
 * مع مؤشر تقدم متزامن مع التشغيل التلقائي.
 */

import * as React from "react"
import { useLocale } from "next-intl"
import useEmblaCarousel from "embla-carousel-react"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ImageIcon,
  PauseIcon,
  PlayIcon,
  StarIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Link } from "@/i18n/navigation"
import { useCurrency } from "@/lib/context/currency-context"
import { SimpliProduct } from "@/lib/actions/store/queries/get_filtered_products"

interface FeaturedHeroSliderProps {
  slides: SimpliProduct[]
}

const AUTOPLAY_DELAY = 6000

const COPY = {
  ar: {
    region: "منتجات مميزة",
    slide: "شريحة",
    of: "من",
    shopNow: "تسوّق الآن",
    viewProduct: "عرض المنتج",
    outOfStock: "نفدت الكمية",
    // علامة LTR حتى تبقى % بعد الرقم
    discount: (value: number) => `خصم \u2066${value}%\u2069`,
    rating: "التقييم",
    reviews: "عدد المراجعات",
    oldPrice: "السعر السابق",
    prev: "الشريحة السابقة",
    next: "الشريحة التالية",
    goTo: "الانتقال إلى الشريحة",
    pause: "إيقاف التشغيل التلقائي",
    play: "تشغيل تلقائي",
  },
  en: {
    region: "Featured products",
    slide: "Slide",
    of: "of",
    shopNow: "Shop now",
    viewProduct: "View product",
    outOfStock: "Out of stock",
    discount: (value: number) => `${value}% OFF`,
    rating: "Rating",
    reviews: "Reviews",
    oldPrice: "Previous price",
    prev: "Previous slide",
    next: "Next slide",
    goTo: "Go to slide",
    pause: "Pause autoplay",
    play: "Start autoplay",
  },
} as const

type Copy = (typeof COPY)[keyof typeof COPY]

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"

const controlClass = cn(
  "flex size-9 shrink-0 items-center justify-center rounded-full border border-border/70 bg-background text-foreground/80 transition-[background-color,color,scale] hover:bg-muted hover:text-foreground active:scale-95",
  focusRing
)

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

/** ظهور متدرج لعناصر الشريحة النشطة */
const revealClass = (isActive: boolean) =>
  cn(
    "transition-[translate,opacity] duration-500 ease-out motion-reduce:transition-none",
    isActive
      ? "translate-y-0 opacity-100"
      : "opacity-0 motion-safe:translate-y-3"
  )

interface SlideItemProps {
  slide: SimpliProduct
  index: number
  total: number
  isActive: boolean
  copy: Copy
  isRtl: boolean
  formatPrice: (value: number) => string
  ArrowIcon: typeof ArrowRightIcon
}

function SlideItem({
  slide,
  index,
  total,
  isActive,
  copy,
  isRtl,
  formatPrice,
  ArrowIcon,
}: SlideItemProps) {
  const [failedUrl, setFailedUrl] = React.useState<string | null>(null)
  const showImage = Boolean(slide.imageUrl) && failedUrl !== slide.imageUrl

  // الوصف قد يحتوي وسوم HTML
  const description = slide.description
    ?.replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()

  const { price, compareAtPrice } = slide
  const brandName = (isRtl && slide.brandNameAr) || slide.brandName
  const categoryName = (isRtl && slide.categoryNameAr) || slide.categoryName
  const hasDiscount =
    price != null && compareAtPrice != null && compareAtPrice > price
  // التقريب للأسفل حتى لا نعلن خصماً أكبر من الحقيقي
  const discount = hasDiscount
    ? Math.floor(((compareAtPrice - price) / compareAtPrice) * 100)
    : 0

  return (
    <div
      role="group"
      aria-roledescription={copy.slide}
      aria-label={`${index + 1} ${copy.of} ${total}`}
      inert={!isActive}
      className="min-w-0 flex-[0_0_100%] ps-3"
    >
      <article className="group/card relative isolate flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-linear-to-br from-muted/70 via-background to-primary/10 md:min-h-96 md:flex-row lg:min-h-104">
        {/* الصورة: أعلى البطاقة على الجوال، وفي الجهة المقابلة للنص على الشاشات الأكبر */}
        <div className="relative aspect-16/10 w-full shrink-0 md:order-2 md:aspect-auto md:w-1/2">
          {/* هالة ناعمة خلف المنتج */}
          <div
            aria-hidden="true"
            className="absolute inset-[12%] -z-10 rounded-full bg-primary/15 blur-3xl"
          />

          {showImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={slide.imageUrl!}
              alt={slide.imageAlt || slide.name}
              loading={index === 0 ? "eager" : "lazy"}
              fetchPriority={index === 0 ? "high" : "auto"}
              decoding="async"
              draggable={false}
              onError={() => setFailedUrl(slide.imageUrl ?? null)}
              className={cn(
                "absolute inset-0 size-full object-contain p-4 drop-shadow-xl transition-[scale,opacity] duration-700 ease-out group-hover/card:scale-105 motion-reduce:transition-none md:p-8",
                isActive ? "opacity-100" : "opacity-0 motion-safe:scale-95"
              )}
            />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground/40">
              <ImageIcon aria-hidden="true" className="size-12 stroke-[1.25]" />
            </div>
          )}

          {discount > 0 && (
            <span className="absolute inset-e-3 top-3 rounded-full bg-destructive px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
              {copy.discount(discount)}
            </span>
          )}
        </div>

        {/* المعلومات */}
        <div className="flex min-w-0 flex-1 flex-col items-start justify-center gap-2.5 p-5 text-start md:order-1 md:gap-3 md:p-8 lg:gap-4 lg:p-12">
          <p
            className={cn(
              revealClass(isActive),
              "flex max-w-full items-center gap-2 text-xs font-medium text-primary"
            )}
          >
            <span className="truncate">{brandName}</span>
            {brandName && categoryName && (
              <span
                aria-hidden="true"
                className="size-1 rounded-full bg-current"
              />
            )}
            <span className="truncate text-muted-foreground">
              {categoryName}
            </span>
          </p>

          <h2
            className={cn(
              revealClass(isActive),
              "line-clamp-2 text-xl leading-snug font-semibold text-balance text-foreground delay-75 md:line-clamp-3 md:text-2xl md:leading-snug lg:text-3xl lg:leading-snug"
            )}
          >
            {/* after: يجعل البطاقة كلها قابلة للنقر برابط واحد */}
            <Link
              href={`/product/${slide.slug}`}
              draggable={false}
              className="outline-none after:absolute after:inset-0 after:z-10 after:rounded-2xl focus-visible:after:ring-2 focus-visible:after:ring-primary focus-visible:after:ring-inset"
            >
              {slide.name}
            </Link>
          </h2>

          {description && (
            <p
              className={cn(
                revealClass(isActive),
                "line-clamp-2 max-w-md text-sm leading-relaxed text-muted-foreground delay-100 max-md:hidden"
              )}
            >
              {description}
            </p>
          )}

          {slide.reviewCount > 0 && (
            <p
              className={cn(
                revealClass(isActive),
                "flex items-center gap-1.5 text-xs text-muted-foreground delay-150"
              )}
            >
              <StarIcon
                aria-hidden="true"
                className="size-3.5 fill-amber-400 text-amber-400"
              />
              <span className="sr-only">{copy.rating}:</span>
              <span className="font-medium text-foreground">
                {slide.rating.toFixed(1)}
              </span>
              <span className="sr-only">{copy.reviews}:</span>
              <span>({slide.reviewCount})</span>
            </p>
          )}

          {!slide.inStock && (
            <p
              className={cn(
                revealClass(isActive),
                "text-xs font-medium text-destructive delay-150"
              )}
            >
              {copy.outOfStock}
            </p>
          )}

          <div
            className={cn(
              revealClass(isActive),
              "mt-auto flex w-full flex-wrap items-center justify-between gap-3 delay-200 md:mt-2 md:w-auto md:justify-start md:gap-6"
            )}
          >
            {price != null && (
              <p className="flex flex-wrap items-baseline gap-x-2">
                <bdi className="text-xl font-bold text-foreground md:text-2xl">
                  {formatPrice(price)}
                </bdi>
                {hasDiscount && (
                  <del className="text-xs text-muted-foreground md:text-sm">
                    <span className="sr-only">{copy.oldPrice}: </span>
                    <bdi>{formatPrice(compareAtPrice)}</bdi>
                  </del>
                )}
              </p>
            )}

            {/* مظهر زر فقط: النقر يمر عبر رابط العنوان */}
            <span
              aria-hidden="true"
              className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground shadow-md shadow-primary/20 md:h-11 md:px-6"
            >
              {slide.inStock ? copy.shopNow : copy.viewProduct}
              <ArrowIcon className="size-4 transition-transform group-hover/card:translate-x-1 rtl:group-hover/card:-translate-x-1" />
            </span>
          </div>
        </div>
      </article>
    </div>
  )
}

export default function FeaturedHeroSlider({
  slides,
}: FeaturedHeroSliderProps) {
  const locale = useLocale()
  const isRtl = locale === "ar"
  const copy = isRtl ? COPY.ar : COPY.en
  const count = slides?.length ?? 0
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

  const ArrowIcon = isRtl ? ArrowLeftIcon : ArrowRightIcon
  const PrevIcon = isRtl ? ChevronRightIcon : ChevronLeftIcon
  const NextIcon = isRtl ? ChevronLeftIcon : ChevronRightIcon

  return (
    <section
      ref={sectionRef}
      aria-roledescription="carousel"
      aria-label={copy.region}
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
            <SlideItem
              key={slide.id}
              slide={slide}
              index={index}
              total={count}
              isActive={index === selectedIndex}
              copy={copy}
              isRtl={isRtl}
              formatPrice={formatPrice}
              ArrowIcon={ArrowIcon}
            />
          ))}
        </div>
      </div>

      {/* شريط التحكم أسفل البطاقة حتى لا يغطي المحتوى */}
      {hasMultiple && (
        <div className="mt-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setUserPaused(!isStopped)}
            aria-label={isStopped ? copy.play : copy.pause}
            className={controlClass}
          >
            {isStopped ? (
              <PlayIcon aria-hidden="true" className="size-3.5" />
            ) : (
              <PauseIcon aria-hidden="true" className="size-3.5" />
            )}
          </button>

          <div className="flex min-w-0 flex-1 items-center justify-center">
            {slides.map((slide, index) => {
              const isSelected = index === selectedIndex

              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => emblaApi?.scrollTo(index)}
                  aria-label={`${copy.goTo} ${index + 1}`}
                  aria-current={isSelected ? "true" : undefined}
                  // مساحة نقر 24px على الأقل مع مؤشر نحيف
                  className={cn(
                    "group/dot flex h-6 min-w-6 items-center justify-center rounded-full px-1",
                    focusRing
                  )}
                >
                  <span
                    className={cn(
                      "relative block h-1.5 overflow-hidden rounded-full transition-[width,background-color] duration-300",
                      isSelected
                        ? "w-8 bg-primary/20"
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

          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => emblaApi?.scrollPrev()}
              aria-label={copy.prev}
              className={cn(controlClass, "max-sm:hidden")}
            >
              <PrevIcon aria-hidden="true" className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => emblaApi?.scrollNext()}
              aria-label={copy.next}
              className={cn(controlClass, "max-sm:hidden")}
            >
              <NextIcon aria-hidden="true" className="size-4" />
            </button>
            {/* يوازن زر الإيقاف على الجوال لتبقى المؤشرات في المنتصف */}
            <span aria-hidden="true" className="size-9 sm:hidden" />
          </div>
        </div>
      )}
    </section>
  )
}
