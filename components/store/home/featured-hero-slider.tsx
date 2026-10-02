"use client"

import * as React from "react"
import Link from "next/link"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"
import { ChevronLeftIcon, ChevronRightIcon, ArrowRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { FeaturedProductSlide } from "@/lib/actions/products/types"

interface FeaturedHeroSliderProps {
  slides: FeaturedProductSlide[]
}

export default function FeaturedHeroSlider({
  slides,
}: FeaturedHeroSliderProps) {
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
    { loop: true, align: "start" },
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
    <div className="relative mx-auto w-full max-w-7xl px-3 py-2 sm:px-6 sm:py-3">
      {/* الحاوية: لون خلفية موحد ثابت bg-muted/50 وبدون حدود أو تدرجات */}
      <div
        className="group relative overflow-hidden rounded-2xl bg-muted/50 sm:rounded-3xl"
        ref={emblaRef}
      >
        <div className="flex touch-pan-y">
          {slides.map((slide) => {
            const formattedPrice = (slide.min_price / 100).toFixed(2)

            return (
              <div
                key={slide.id}
                className="min-w-0 flex-[0_0_100%] transition-opacity duration-300"
              >
                {/* الحفاظ على الترتيب المستطيل الأفقي مع ضبط الأبعاد للشاشات الصغيرة والكبيرة */}
                <div className="flex h-36 items-center justify-between gap-3 px-4 py-3 sm:h-56 sm:gap-8 sm:px-8 sm:py-6 md:h-64 md:px-10">
                  {/* قسم النصوص والمعلومات */}
                  <div className="flex flex-1 flex-col items-start justify-center space-y-1 sm:space-y-2">
                    {slide.brand_name && (
                      <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase sm:text-xs">
                        {slide.brand_name}
                      </span>
                    )}

                    <h2 className="line-clamp-1 text-sm font-bold tracking-tight text-foreground sm:text-xl md:text-2xl">
                      {slide.name}
                    </h2>

                    <div className="text-sm font-extrabold text-primary tabular-nums sm:text-xl md:text-2xl">
                      ${formattedPrice}
                    </div>

                    <div className="pt-0.5 sm:pt-1">
                      <Button
                        asChild
                        size="sm"
                        className="h-7 rounded-full px-3 text-[11px] font-medium shadow-none sm:h-8 sm:px-4 sm:text-xs"
                      >
                        <Link href={`/product/${slide.slug}`}>
                          Shop Now
                          <ArrowRightIcon className="ms-1 size-3 sm:size-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>

                  {/* قسم الصورة: تم إزالة الظلال بالكامل */}
                  <div className="flex h-full w-28 shrink-0 items-center justify-center sm:w-48 md:w-60">
                    {slide.primary_image_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={slide.primary_image_url}
                        alt={slide.name}
                        loading="lazy"
                        className="max-h-24 max-w-full object-contain transition-transform duration-300 group-hover:scale-105 sm:max-h-44 md:max-h-52"
                      />
                    ) : (
                      <div className="flex size-16 items-center justify-center rounded-xl bg-background text-[10px] text-muted-foreground sm:size-24 sm:text-xs">
                        No Image
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* أزرار التنقل الجانبية */}
        {slides.length > 1 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-between p-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100 sm:p-2.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={scrollPrev}
              className="pointer-events-auto size-7 rounded-full bg-background/80 shadow-xs backdrop-blur-xs hover:bg-background sm:size-8"
              aria-label="Previous Slide"
            >
              <ChevronLeftIcon className="size-3.5 sm:size-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={scrollNext}
              className="pointer-events-auto size-7 rounded-full bg-background/80 shadow-xs backdrop-blur-xs hover:bg-background sm:size-8"
              aria-label="Next Slide"
            >
              <ChevronRightIcon className="size-3.5 sm:size-4" />
            </Button>
          </div>
        )}

        {/* مؤشرات التمرير السفلية */}
        {slides.length > 1 && (
          <div className="absolute inset-x-0 bottom-1.5 flex items-center justify-center gap-1 sm:bottom-2 sm:gap-1.5">
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`h-1 rounded-full transition-all duration-300 sm:h-1.5 ${
                  index === selectedIndex
                    ? "w-4 bg-primary sm:w-5"
                    : "w-1 bg-foreground/15 hover:bg-foreground/25 sm:w-1.5"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
