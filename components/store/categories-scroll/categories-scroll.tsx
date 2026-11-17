/**
 * @file components/store/home/categories-scroll.tsx
 * @description Horizontal scrollable categories component utilizing shadcn Carousel with a constant edge fade and RTL support.
 */

"use client"

import * as React from "react"
import { useLocale, useTranslations } from "next-intl"
import { LayoutGridIcon } from "lucide-react"

import { SimplifiedRootCategory } from "@/lib/actions/store/queries/get-root-categories"
import { getSiteAssetUrl } from "@/lib/database/supabase/storage"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CategoriesScrollProps {
  categories: SimplifiedRootCategory[]
  onSelect?: (categoryId: string) => void
  onSeeAll?: () => void
}

const RTL_LOCALES = ["ar", "fa", "ur", "he"]

// تلاشي ثابت ومتماثل على الحافتين (لا يعتمد على حالة التمرير ولا على اتجاه اللغة)
// يجب ألا يتجاوز عرض التلاشي أصغر حشو جانبي (16px) ليبقى العنصر الأول ظاهراً بالكامل
const FADE_SIZE = "16px"
const MASK_STYLE = `linear-gradient(to right, transparent 0, black ${FADE_SIZE}, black calc(100% - ${FADE_SIZE}), transparent 100%)`

export default function CategoriesScroll({
  categories,
  onSelect,
  onSeeAll,
}: CategoriesScrollProps) {
  const locale = useLocale()
  const t = useTranslations("CategoriesScroll")
  const isRtl = RTL_LOCALES.includes(locale)

  const [selectedCategory, setSelectedCategory] = React.useState<string>("*")

  if (!categories || categories.length === 0) return null

  const handleOnSelect = (slug: string, id: string) => {
    const categoryId = slug === "*" ? "*" : id
    setSelectedCategory(slug)
    onSelect?.(categoryId)
  }

  return (
    <div className="flex flex-col space-y-2" dir={isRtl ? "rtl" : "ltr"}>
      {/* الترويسة */}
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
          {t("title")}
        </h2>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="rounded-full text-sm text-primary"
          onClick={onSeeAll}
        >
          {t("SEE_ALL")}
        </Button>
      </div>

      {/* شريط التصنيفات مع تلاشي ثابت على الجانبين */}
      <Carousel
        opts={{
          align: "start",
          containScroll: "trimSnaps",
          direction: isRtl ? "rtl" : "ltr",
        }}
        // الحشو البدائي يوضع على الـ viewport (عنصر overflow-hidden داخل CarouselContent)
        // وليس على الحاوية الداخلية، لأن Embla يحسب موضع أول عنصر من الحاوية ويلغي حشوها
        // فيلتصق العنصر الأول بالحافة. هكذا يبدأ العنصر الأول بمسافة ويختفي عند حافة الشاشة أثناء التمرير.
        className="w-full [&_.overflow-hidden]:ps-4 sm:[&_.overflow-hidden]:ps-6 lg:[&_.overflow-hidden]:ps-8"
      >
        <div
          style={{
            maskImage: MASK_STYLE,
            WebkitMaskImage: MASK_STYLE,
          }}
        >
          {/* m-0 و p-0 تلغيان الهوامش الفيزيائية الافتراضية (ml/pl) ليعمل RTL بشكل صحيح، والمسافة عبر gap.
              pe بضعف قيمة ps لأن Embla يحسب نهاية التمرير بدون حشو الـ viewport، فيبقى العنصر الأخير بمسافة من الحافة */}
          <CarouselContent className="m-0 gap-3 py-1 pe-8 sm:pe-12 lg:pe-16">
            {categories.map((category) => {
              const displayName =
                locale === "ar"
                  ? category.name_ar || category.name
                  : category.name

              const imageUrl = getSiteAssetUrl(category.image_url)
              const isActive = category.slug === selectedCategory

              return (
                <CarouselItem key={category.slug} className="basis-auto p-0">
                  <Button
                    variant={isActive ? "default" : "outline"}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => handleOnSelect(category.slug, category.id)}
                    className={cn(
                      "h-10 rounded-lg px-4",
                      isActive ? "border-primary" : "border-muted-foreground",
                      "transition-all ease-in-out duration-200"
                    )}
                  >
                    {/* أيقونة أو صورة التصنيف */}
                    <div className="hidden size-7 shrink-0 sm:size-8 lg:flex">
                      {imageUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={imageUrl}
                          alt={category.image_alt || displayName}
                          loading="lazy"
                          className="size-full rounded-lg object-contain p-1 dark:invert"
                        />
                      ) : (
                        <LayoutGridIcon className="size-3.5 sm:size-4" />
                      )}
                    </div>

                    <span className="whitespace-nowrap">{displayName}</span>
                  </Button>
                </CarouselItem>
              )
            })}
          </CarouselContent>
        </div>
      </Carousel>
    </div>
  )
}
