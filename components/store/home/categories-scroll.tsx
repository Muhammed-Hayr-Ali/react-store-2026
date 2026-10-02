"use client"

import * as React from "react"
import Link from "next/link"
import { useLocale } from "next-intl"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeftIcon, ChevronRightIcon, LayoutGridIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Category } from "@/lib/actions/categories/types"
import { getSiteAssetUrl } from "@/lib/database/supabase/storage"

interface CategoriesScrollProps {
  categories: Category[]
}

export default function CategoriesScroll({
  categories,
}: CategoriesScrollProps) {
  const locale = useLocale()
  const isRtl = locale === "ar"

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

  if (!categories || categories.length === 0) return null

  const startStop = (isRtl ? canScrollPrev : canScrollPrev)
    ? "transparent 0%, black 48px"
    : "black 0%"
  const endStop = (isRtl ? canScrollNext : canScrollNext)
    ? "black calc(100% - 48px), transparent 100%"
    : "black 100%"
  const maskStyle = `linear-gradient(to right, ${startStop}, ${endStop})`

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-3 sm:px-6 lg:px-8">
      {/* الترويسة وأزرار التمرير السريعة */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold tracking-tight text-foreground sm:text-base">
          {isRtl ? "التصنيفات" : "Categories"}
        </h3>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className="size-7 rounded-full text-muted-foreground hover:bg-muted disabled:opacity-30 sm:size-8"
            aria-label="Previous categories"
          >
            {isRtl ? (
              <ChevronRightIcon className="size-4" />
            ) : (
              <ChevronLeftIcon className="size-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={scrollNext}
            disabled={!canScrollNext}
            className="size-7 rounded-full text-muted-foreground hover:bg-muted disabled:opacity-30 sm:size-8"
            aria-label="Next categories"
          >
            {isRtl ? (
              <ChevronLeftIcon className="size-4" />
            ) : (
              <ChevronRightIcon className="size-4" />
            )}
          </Button>
        </div>
      </div>

      {/* مسار السحب مع تطبيق التلاشي التلقائي عند الحواف */}
      <div
        className="overflow-hidden transition-all duration-300"
        ref={emblaRef}
        style={{
          maskImage: maskStyle,
          WebkitMaskImage: maskStyle,
        }}
      >
        <div className="flex gap-2 py-1 sm:gap-3">
          {categories.map((category) => {
            const displayName =
              isRtl && category.name_ar ? category.name_ar : category.name

            const imageUrl = getSiteAssetUrl(category.image_url)

            return (
              <Link
                key={category.id}
                href={`/${locale}/category/${category.slug}`}
                className="group flex shrink-0 items-center gap-2.5 rounded-xl bg-muted/50 px-3.5 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none sm:px-4 sm:py-2.5 sm:text-sm"
              >
                {/* أيقونة أو صورة التصنيف */}
                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-background text-muted-foreground transition-transform duration-200 group-hover:scale-105 sm:size-8">
                  {imageUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={imageUrl}
                      alt={category.image_alt || displayName}
                      loading="lazy"
                      className="size-full rounded-lg object-contain p-1 transition-all duration-200 dark:brightness-0 dark:invert"
                    />
                  ) : (
                    <LayoutGridIcon className="size-3.5 sm:size-4" />
                  )}
                </div>

                <span className="whitespace-nowrap">{displayName}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
