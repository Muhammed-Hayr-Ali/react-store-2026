"use client"

/**
 * @file components/store/shop-by-category-slider/category-card.tsx
 * @description بطاقة تصنيف واحدة داخل سلايدر التصنيفات.
 */

import * as React from "react"
import { ArrowLeftIcon, ArrowRightIcon, ImageIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Link } from "@/i18n/navigation"
import type { SimplifiedRootCategory } from "@/lib/actions/store/queries/get-all-categories"
import { focusRing } from "./category-carousel-styles"

interface CategoryCardProps {
  category: SimplifiedRootCategory
  isRtl: boolean
}

export function CategoryCard({ category, isRtl }: CategoryCardProps) {
  const [failedUrl, setFailedUrl] = React.useState<string | null>(null)
  const showImage =
    Boolean(category.image_url) && failedUrl !== category.image_url
  const title = (isRtl && category.name_ar) || category.name
  const ArrowIcon = isRtl ? ArrowLeftIcon : ArrowRightIcon

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