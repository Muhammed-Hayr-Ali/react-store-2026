/**
 * @file components/store/home/categories-scroll.tsx
 * @description Horizontal scrollable categories component utilizing shadcn Carousel with localized gradient mask and RTL support.
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { useLocale, useTranslations } from "next-intl"
import { ChevronLeftIcon, ChevronRightIcon, LayoutGridIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { SimplifiedRootCategory } from "@/lib/actions/store/queries/get-root-categories"
import { getSiteAssetUrl } from "@/lib/database/supabase/storage"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"

interface CategoriesScrollProps {
  categories: SimplifiedRootCategory[]
}

export default function CategoriesScroll({
  categories,
}: CategoriesScrollProps) {
  const locale = useLocale()
  const t = useTranslations("CategoriesScroll")
  const isRtl = locale === "ar"

  const [carouselApi, setCarouselApi] = React.useState<CarouselApi>()
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)

  const scrollPrev = React.useCallback(() => {
    carouselApi?.scrollPrev()
  }, [carouselApi])

  const scrollNext = React.useCallback(() => {
    carouselApi?.scrollNext()
  }, [carouselApi])

  React.useEffect(() => {
    if (!carouselApi) return

    const updateScrollState = () => {
      setCanScrollPrev(carouselApi.canScrollPrev())
      setCanScrollNext(carouselApi.canScrollNext())
    }

    updateScrollState()
    carouselApi.on("select", updateScrollState)
    carouselApi.on("reInit", updateScrollState)

    return () => {
      carouselApi.off("select", updateScrollState)
      carouselApi.off("reInit", updateScrollState)
    }
  }, [carouselApi])

  if (!categories || categories.length === 0) return null

  // حساب أقنعة التلاشي (Gradient Mask) بناءً على إمكانية التمرير واتجاه اللغة
  const leftHasScroll = isRtl ? canScrollNext : canScrollPrev
  const rightHasScroll = isRtl ? canScrollPrev : canScrollNext

  const leftStop = leftHasScroll ? "transparent 0%, black 48px" : "black 0%"
  const rightStop = rightHasScroll
    ? "black calc(100% - 48px), transparent 100%"
    : "black 100%"

  const maskStyle = `linear-gradient(to right, ${leftStop}, ${rightStop})`

  return (
    <div className="py-3">
      {/* الترويسة وأزرار التمرير السريعة */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
          {t("title", { default: "Categories" })}
        </h2>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className="size-7 rounded-full text-muted-foreground hover:bg-muted disabled:opacity-30 sm:size-8"
            aria-label={t("previous_aria", { default: "Previous categories" })}
          >
            <ChevronLeftIcon className="size-4 rtl:rotate-180" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={scrollNext}
            disabled={!canScrollNext}
            className="size-7 rounded-full text-muted-foreground hover:bg-muted disabled:opacity-30 sm:size-8"
            aria-label={t("next_aria", { default: "Next categories" })}
          >
            <ChevronRightIcon className="size-4 rtl:rotate-180" />
          </Button>
        </div>
      </div>

      {/* شريط الـ Carousel مع تطبيق تأثير التلاشي وحفظ الـ API للتحكم */}
      <Carousel
        setApi={setCarouselApi}
        opts={{
          align: "start",
          containScroll: "trimSnaps",
          direction: isRtl ? "rtl" : "ltr",
        }}
        className="w-full"
      >
        <div
          className="overflow-hidden transition-all duration-300"
          style={{
            maskImage: maskStyle,
            WebkitMaskImage: maskStyle,
          }}
        >
          <CarouselContent className="-ml-2 md:-ml-3">
            {categories.map((category) => {
              const displayName =
                locale === "ar"
                  ? category.name_ar || category.name
                  : category.name

              const imageUrl = getSiteAssetUrl(category.image_url)

              return (
                <CarouselItem
                  key={category.slug}
                  className="basis-auto pl-2 md:pl-3"
                >
                  <Link
                    href={`/${locale}/categories/${category.slug}`}
                    className="group flex shrink-0 items-center gap-2.5 rounded-xl bg-muted/50 px-3.5 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none sm:px-4 sm:py-2.5 sm:text-sm"
                  >
                    {/* أيقونة أو صورة التصنيف */}
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-background text-muted-foreground transition-transform duration-200 group-hover:scale-105 sm:size-8">
                      <AspectRatio
                        ratio={1 / 1}
                        className="flex w-full items-center justify-center"
                      >
                        {imageUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={imageUrl}
                            alt={category.image_alt || displayName}
                            loading="lazy"
                            className="size-full rounded-lg object-contain p-1 transition-all duration-200 dark:invert"
                          />
                        ) : (
                          <LayoutGridIcon className="size-3.5 sm:size-4" />
                        )}
                      </AspectRatio>
                    </div>

                    <span className="whitespace-nowrap">{displayName}</span>
                  </Link>
                </CarouselItem>
              )
            })}
          </CarouselContent>
        </div>
      </Carousel>
    </div>
  )
}
