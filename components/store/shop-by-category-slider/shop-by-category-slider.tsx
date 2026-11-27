"use client"

/**
 * @file components/store/category-carousel/category-carousel.tsx
 * @description سلايدر أفقي للتصنيفات الرئيسية باستخدام shadcn/ui Carousel مع ترجمات next-intl.
 */

import * as React from "react"
import { useLocale, useTranslations } from "next-intl"
import { ArrowLeftIcon, ArrowRightIcon, ImageIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Link } from "@/i18n/navigation"
import { SimplifiedRootCategory } from "@/lib/actions/store/queries/get-all-categories"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

interface CategoryCarouselProps {
  categories?: SimplifiedRootCategory[]
}

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"

interface CategoryCardProps {
  category: SimplifiedRootCategory
  isRtl: boolean
  ArrowIcon: typeof ArrowLeftIcon
}

function CategoryCard({ category, isRtl, ArrowIcon }: CategoryCardProps) {
  const [failedUrl, setFailedUrl] = React.useState<string | null>(null)
  const showImage =
    Boolean(category.image_url) && failedUrl !== category.image_url
  const title = (isRtl && category.name_ar) || category.name

  return (
    <Link
      href={`/category/${category.slug}`}
      draggable={false}
      className={cn(
        "group/cat flex flex-col gap-4 rounded-xl sm:rounded-2xl",
        focusRing
      )}
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted/50 sm:rounded-2xl">
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={category.image_url!}
            alt={category.image_alt || title}
            loading="lazy"
            decoding="async"
            draggable={false}
            onError={() => setFailedUrl(category.image_url ?? null)}
            className="size-full scale-[1.12] object-cover transition-transform duration-500 ease-out group-hover/cat:scale-[1.18] motion-reduce:transition-none"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground/40">
            <ImageIcon
              aria-hidden="true"
              className="size-8 stroke-[1.25] sm:size-10"
            />
          </div>
        )}
      </div>

      <div className="flex w-full min-w-0 items-center justify-between gap-2 px-0.5 text-xs font-normal text-foreground sm:text-sm">
        <span className="min-w-0 flex-1 truncate transition-colors group-hover/cat:text-primary">
          {title}
        </span>
        <ArrowIcon
          aria-hidden="true"
          className="hidden size-4 shrink-0 text-foreground/70 transition-transform duration-300 group-hover/cat:translate-x-1 group-hover/cat:text-primary sm:block rtl:group-hover/cat:-translate-x-1"
        />
      </div>
    </Link>
  )
}

export default function CategoryCarousel({
  categories = [],
}: CategoryCarouselProps) {
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
          containScroll: "trimSnaps",
          dragFree: true,
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
              <CategoryCard
                category={category}
                isRtl={isRtl}
                ArrowIcon={ArrowIcon}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  )
}
