"use client"

/**
 * @file components/store/featured-hero-slider/featured-slide-item.tsx
 * @description بطاقة الشريحة الواحدة داخل سلايدر المنتجات المميزة.
 */

import * as React from "react"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ImageIcon,
  StarIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Link } from "@/i18n/navigation"
import type { SimpliProduct } from "@/lib/actions/store/queries/get_filtered_products"
import { focusRing, revealClass, type SliderTranslations } from "./slider-utils"

interface FeaturedSlideItemProps {
  slide: SimpliProduct
  index: number
  total: number
  isActive: boolean
  t: SliderTranslations
  isRtl: boolean
  formatPrice: (value: number) => string
}

export function FeaturedSlideItem({
  slide,
  index,
  total,
  isActive,
  t,
  isRtl,
  formatPrice,
}: FeaturedSlideItemProps) {
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

  const productHref = `/product/${slide.slug}`
  const ArrowIcon = isRtl ? ArrowLeftIcon : ArrowRightIcon

  return (
    <div
      role="group"
      aria-roledescription={t("slide")}
      aria-label={t("slideAriaLabel", { index: index + 1, total })}
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
              {isRtl
                ? `خصم \u2066${discount}%\u2069`
                : t("discount", { value: discount })}
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
            {slide.name}
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
              <span className="sr-only">{t("rating")}:</span>
              <span className="font-medium text-foreground">
                {slide.rating.toFixed(1)}
              </span>
              <span className="sr-only">{t("reviews")}:</span>
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
              {t("outOfStock")}
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
                    <span className="sr-only">{t("oldPrice")}: </span>
                    <bdi>{formatPrice(compareAtPrice)}</bdi>
                  </del>
                )}
              </p>
            )}

            {/* after: يوسّع مساحة النقر لتشمل كامل البطاقة */}
            <Link
              href={productHref}
              draggable={false}
              tabIndex={isActive ? 0 : -1}
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground shadow-md shadow-primary/20 transition-colors after:absolute after:inset-0 after:z-10 after:rounded-2xl hover:bg-primary/90 md:h-11 md:px-6",
                focusRing
              )}
            >
              {slide.inStock ? t("shopNow") : t("viewProduct")}
              <ArrowIcon className="size-4 transition-transform group-hover/card:translate-x-1 rtl:group-hover/card:-translate-x-1" />
            </Link>
          </div>
        </div>
      </article>
    </div>
  )
}
