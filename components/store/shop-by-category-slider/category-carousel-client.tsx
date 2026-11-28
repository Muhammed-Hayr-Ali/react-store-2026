"use client"

/**
 * @file components/store/shop-by-category-slider/category-carousel-client.tsx
 * @description الغلاف التفاعلي لسلايدر التصنيفات الرئيسية مع دعم RTL/LTR والترجمة.
 */

import * as React from "react"
import { useLocale, useTranslations } from "next-intl"
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Link } from "@/i18n/navigation"
import type { SimplifiedRootCategory } from "@/lib/actions/store/queries/get-all-categories"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { CategoryCard } from "./category-card"
import { focusRing } from "./category-carousel-styles"

interface CategoryCarouselClientProps {
  categories: SimplifiedRootCategory[]
}

export function CategoryCarouselClient({
  categories,
}: CategoryCarouselClientProps) {
  const t = useTranslations("CategoryCarousel")
  const locale = useLocale()
  const isRtl = locale === "ar"

  if (categories.length === 0) return null

  const ArrowIcon = isRtl ? ArrowLeftIcon : ArrowRightIcon

  return (
    <section
      aria-label={t("title")}
      dir={isRtl ? "rtl" : "ltr"}
      className="w-full"
    >
      <Carousel
        opts={{
          align: "start",
          slidesToScroll: 1,
          containScroll: "trimSnaps",
          direction: isRtl ? "rtl" : "ltr",
        }}
        className="w-full space-y-4"
      >
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-black tracking-tight text-foreground md:text-xl">
            {t("title")}
          </h2>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/categories"
              className={cn(
                "group/all inline-flex items-center gap-1.5 rounded-full px-1.5 py-1 text-xs font-normal text-foreground/80 transition-colors hover:text-primary sm:text-sm",
                focusRing
              )}
            >
              <span>{t("viewAll")}</span>
              <ArrowIcon
                aria-hidden="true"
                className="size-3.5 shrink-0 transition-transform group-hover/all:translate-x-0.5 rtl:group-hover/all:-translate-x-0.5"
              />
            </Link>

            <div className="flex items-center gap-1">
              <CarouselPrevious
                variant="ghost"
                aria-label={t("prev")}
                className="static size-8 translate-x-0 translate-y-0 rounded-full border-0 text-foreground/80 hover:bg-muted/70 hover:text-foreground"
              />
              <CarouselNext
                variant="ghost"
                aria-label={t("next")}
                className="static size-8 translate-x-0 translate-y-0 rounded-full border-0 text-foreground/80 hover:bg-muted/70 hover:text-foreground"
              />
            </div>
          </div>
        </div>

        <CarouselContent className="-ms-2.5 sm:-ms-3">
          {categories.map((category) => (
            <CarouselItem
              key={category.id}
              className="basis-[28.5%] ps-2.5 sm:basis-[25%] sm:ps-3 md:basis-[22%] lg:basis-[20%]"
            >
              <CategoryCard category={category} isRtl={isRtl} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  )
}