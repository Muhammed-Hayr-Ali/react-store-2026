"use client"

import * as React from "react"
import Link from "next/link"
import { useLocale } from "next-intl"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"
import { ChevronLeftIcon, ChevronRightIcon, ImageIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { FeaturedProductSlide } from "@/lib/actions/products/types"
import type { CurrencyCode } from "@/lib/actions/currency/types"

interface FeaturedHeroSliderProps {
  slides: FeaturedProductSlide[]
  currency: CurrencyCode
  exchangeRate: number
}

function SlideItem({
  slide,
  locale,
}: {
  slide: FeaturedProductSlide
  locale: string
}) {
  const [imageError, setImageError] = React.useState(false)

  return (
    <div className="relative min-w-0 flex-[0_0_100%] transition-opacity duration-300">
      <Link
        href={`/${locale}/product/${slide.slug}`}
        className="relative block h-56 w-full overflow-hidden bg-muted/40 sm:h-72 md:h-84 lg:h-96"
      >
        {slide.primary_image_url && !imageError ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={slide.primary_image_url}
            alt={slide.name}
            loading="lazy"
            onError={() => setImageError(true)}
            className="size-full border-0 object-cover object-center transition-transform duration-500 group-hover:scale-[1.01]"
          />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2 bg-muted/50 text-muted-foreground/60">
            <ImageIcon className="size-10 stroke-[1.5] sm:size-12" />
            <span className="text-xs font-medium">{slide.name}</span>
          </div>
        )}
      </Link>
    </div>
  )
}

export default function FeaturedHeroSlider({
  slides,
}: FeaturedHeroSliderProps) {
  const locale = useLocale()
  const isRtl = locale === "ar"

  const plugins = React.useMemo(
    () => [
      Autoplay({
        delay: 5000,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      }),
    ],
    []
  )

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      direction: isRtl ? "rtl" : "ltr",
    },
    plugins
  )

  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([])

  const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const scrollTo = React.useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index)
    },
    [emblaApi]
  )

  React.useEffect(() => {
    if (!emblaApi) return

    const onInit = () => {
      setScrollSnaps(emblaApi.scrollSnapList())
      setSelectedIndex(emblaApi.selectedScrollSnap())
    }

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap())
    }

    emblaApi.on("init", onInit)
    emblaApi.on("reInit", onInit)
    emblaApi.on("select", onSelect)

    if (emblaApi.scrollSnapList().length > 0) {
      onInit()
    }

    return () => {
      emblaApi.off("init", onInit)
      emblaApi.off("reInit", onInit)
      emblaApi.off("select", onSelect)
    }
  }, [emblaApi])

  if (!slides || slides.length === 0) return null

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-2 sm:px-6 sm:py-3 lg:px-8">
      <div
        className="group relative overflow-hidden rounded-2xl border-0 sm:rounded-3xl"
        ref={emblaRef}
      >
        <div className="flex touch-pan-y">
          {slides.map((slide) => (
            <SlideItem key={slide.id} slide={slide} locale={locale} />
          ))}
        </div>

        {/* أزرار التنقل الجانبية */}
        {slides.length > 1 && (
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-between p-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100 sm:p-2.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={scrollPrev}
              className="pointer-events-auto size-7 rounded-full bg-background/80 shadow-xs backdrop-blur-xs hover:bg-background sm:size-8"
              aria-label="Previous slide"
            >
              <ChevronLeftIcon className="size-3.5 sm:size-4 rtl:rotate-180" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={scrollNext}
              className="pointer-events-auto size-7 rounded-full bg-background/80 shadow-xs backdrop-blur-xs hover:bg-background sm:size-8"
              aria-label="Next slide"
            >
              <ChevronRightIcon className="size-3.5 sm:size-4 rtl:rotate-180" />
            </Button>
          </div>
        )}

        {/* مؤشرات التمرير السفلية */}
        {slides.length > 1 && (
          <div className="absolute inset-x-0 bottom-2 z-20 flex items-center justify-center gap-1 sm:bottom-2.5 sm:gap-1.5">
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`h-1 rounded-full transition-all duration-300 sm:h-1.5 ${
                  index === selectedIndex
                    ? "w-4 bg-primary sm:w-5"
                    : "w-1 bg-foreground/25 hover:bg-foreground/40 sm:w-1.5"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
