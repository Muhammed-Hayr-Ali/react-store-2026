"use client"

import * as React from "react"
import { useLocale, useTranslations } from "next-intl"
import { ArrowLeft, ArrowRight, ChevronDown, LayoutGrid } from "lucide-react"

import { cn } from "@/lib/utils"
import { Link, useRouter } from "@/i18n/navigation"
import { APP_ROUTES } from "@/lib/config/app-routes"
import type {
  SimplifiedRootCategory,
  StoreSubcategory,
} from "@/lib/actions/store/queries/get-all-categories"
import {
  LargeDialog,
  LargeDialogContent,
  LargeDialogTitle,
  LargeDialogTrigger,
} from "@/components/ui/large-dialog"
import { focusRing, isRtlLocale } from "./store-header-shared"

export interface StoreCategoriesButtonProps {
  compact?: boolean
  className?: string
  categories?: SimplifiedRootCategory[]
}

const DESKTOP_QUERY = "(min-width: 768px)"

export function StoreCategoriesButton({
  compact = false,
  className,
  categories = [],
}: StoreCategoriesButtonProps) {
  const t = useTranslations("StoreHeader")
  const locale = useLocale()
  const router = useRouter()

  const isRtl = isRtlLocale(locale)
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight

  const [open, setOpen] = React.useState(false)
  const [selectedId, setSelectedId] = React.useState<string | null>(null)

  // التصنيف النشط مشتق: إذا لم يعد selectedId موجوداً نرجع لأول تصنيف
  const activeCategory = React.useMemo(
    () => categories.find((item) => item.id === selectedId) ?? categories[0],
    [categories, selectedId]
  )

  const getCategoryTitle = React.useCallback(
    (name: string, nameAr: string | null) => (isRtl && nameAr ? nameAr : name),
    [isRtl]
  )

  const activeTitle = activeCategory
    ? getCategoryTitle(activeCategory.name, activeCategory.name_ar)
    : ""
  const activeHref = activeCategory
    ? `${APP_ROUTES.CATEGORIES}/${activeCategory.slug}`
    : APP_ROUTES.CATEGORIES

  const close = React.useCallback(() => setOpen(false), [])

  // إغلاق النافذة إذا صغرت الشاشة عن md أثناء فتحها
  // (المحتوى مخفي على الجوال، فكان يبقى الـ overlay وحده)
  React.useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY)
    const onChange = (e: MediaQueryListEvent) => {
      if (!e.matches) setOpen(false)
    }
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      const isDesktop = window.matchMedia(DESKTOP_QUERY).matches
      // على الجوال أو بدون تصنيفات: ننتقل لصفحة التصنيفات بدل زر "ميت"
      if (!isDesktop || categories.length === 0) {
        router.push(APP_ROUTES.CATEGORIES)
        return
      }
    }
    setOpen(nextOpen)
  }

  const triggerClassName = cn(
    "hidden items-center rounded-lg px-2.5 font-normal text-foreground transition-colors hover:bg-muted/60 hover:text-primary lg:flex",
    compact ? "h-8 gap-1" : "h-9 gap-1.5",
    focusRing,
    className
  )

  return (
    <LargeDialog open={open} onOpenChange={handleOpenChange}>
      <LargeDialogTrigger asChild>
        <button type="button" className={triggerClassName}>
          {!compact && (
            <LayoutGrid aria-hidden="true" className="size-3.5 text-primary" />
          )}
          <span>{t("categories")}</span>
          {categories.length > 0 && (
            <ChevronDown
              aria-hidden="true"
              className={cn(
                "hidden size-3.5 text-muted-foreground transition-transform duration-200 md:inline-block",
                open && "rotate-90 text-primary ltr:-rotate-90"
              )}
            />
          )}
        </button>
      </LargeDialogTrigger>

      {categories.length > 0 && activeCategory && (
        <LargeDialogContent
          aria-describedby={undefined}
          closeLabel={t("close")}
          // عرض ثابت: لا يتغير حجم النافذة عند التنقل بين التصنيفات
          className="hidden max-h-[90vh] w-[min(64rem,92vw)] gap-0 overflow-hidden bg-background p-0 font-normal md:flex"
        >
          {/* رأس النافذة */}
          <div className="shrink-0 border-b border-border/70 px-7 py-4 pe-14 text-start">
            <LargeDialogTitle className="text-lg font-medium text-foreground">
              {t("categories")}
            </LargeDialogTitle>
          </div>

          {/* المحتوى القابل للتمرير */}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {/* التصنيفات الرئيسية (اختيار بالنقر) */}
            <div className="border-b border-border/70 bg-muted/30 px-7 py-4">
              <div
                role="group"
                aria-label={t("categories")}
                className="grid grid-cols-2 gap-x-3 gap-y-1.5 lg:grid-cols-3"
              >
                {categories.map((category) => {
                  const isActive = activeCategory.id === category.id
                  const title = getCategoryTitle(
                    category.name,
                    category.name_ar
                  )

                  return (
                    <button
                      key={category.id}
                      type="button"
                      aria-pressed={isActive}
                      title={title}
                      onClick={() => setSelectedId(category.id)}
                      className={cn(
                        "group relative flex w-full min-w-0 items-center justify-between gap-3 overflow-hidden rounded-lg py-2.5 ps-4 pe-3 text-start text-[13px] transition-colors duration-200",
                        "before:pointer-events-none before:absolute before:inset-y-2.5 before:inset-s-0 before:w-1 before:rounded-e-full before:bg-primary before:transition-all before:duration-200",
                        focusRing,
                        isActive
                          ? "bg-background font-medium text-foreground shadow-xs ring-1 ring-border/80 before:scale-y-100 before:opacity-100"
                          : "font-normal text-foreground/80 before:scale-y-50 before:opacity-0 hover:bg-background/70 hover:text-foreground"
                      )}
                    >
                      <span className="truncate">{title}</span>
                      <ArrowIcon
                        aria-hidden="true"
                        className={cn(
                          "size-4 shrink-0 transition-all",
                          isActive
                            ? "text-primary"
                            : "text-foreground/50 group-hover:translate-x-0.5 group-hover:text-foreground/80 rtl:group-hover:-translate-x-0.5"
                        )}
                      />
                    </button>
                  )
                })}
              </div>
            </div>

            {/* لوحة التصنيف النشط: key يعيد تشغيل حركة الظهور عند التبديل */}
            <div className="px-7 py-5">
              <div
                key={activeCategory.id}
                className="flex animate-in items-start gap-7 duration-200 fade-in-0 motion-reduce:animate-none"
              >
                {/* صورة التصنيف */}
                <Link
                  href={activeHref}
                  onClick={close}
                  aria-label={activeTitle}
                  className={cn(
                    "group relative block aspect-4/3 w-52.5 shrink-0 overflow-hidden rounded-xl border border-border/60 bg-muted/40",
                    focusRing
                  )}
                >
                  {activeCategory.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={activeCategory.image_url}
                      alt={activeCategory.image_alt || activeTitle}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <LayoutGrid
                        aria-hidden="true"
                        className="size-7 text-muted-foreground/40"
                      />
                    </div>
                  )}
                </Link>

                {/* العنوان + عرض الكل + التصنيفات الفرعية */}
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="mb-3 flex items-center justify-between gap-4 border-b border-border/60 pb-3">
                    <h3 className="min-w-0 truncate text-base font-medium text-foreground">
                      {activeTitle}
                    </h3>
                    <Link
                      href={activeHref}
                      onClick={close}
                      className={cn(
                        "group inline-flex shrink-0 items-center gap-2 rounded-full border border-border/80 px-3.5 py-1.5 text-xs font-normal text-foreground/80 transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-primary",
                        focusRing
                      )}
                    >
                      <span>{t("viewAll")}</span>
                      <ArrowIcon
                        aria-hidden="true"
                        className="size-3.5 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
                      />
                    </Link>
                  </div>

                  <div>
                    {activeCategory.subcategories.length > 0 ? (
                      <ul className="grid grid-cols-2 gap-x-6 gap-y-0.5 lg:grid-cols-3">
                        {activeCategory.subcategories.map(
                          (sub: StoreSubcategory) => {
                            const subTitle = getCategoryTitle(
                              sub.name,
                              sub.name_ar
                            )
                            return (
                              <li key={sub.id} className="min-w-0">
                                <Link
                                  href={`${APP_ROUTES.CATEGORIES}/${activeCategory.slug}/${sub.slug}`}
                                  onClick={close}
                                  title={subTitle}
                                  className={cn(
                                    "-mx-2 block truncate rounded-md px-2 py-1.5 text-[13px] font-normal text-foreground/80 transition-colors hover:bg-muted/60 hover:text-primary",
                                    focusRing
                                  )}
                                >
                                  {subTitle}
                                </Link>
                              </li>
                            )
                          }
                        )}
                      </ul>
                    ) : (
                      <p className="py-2 text-xs font-normal text-muted-foreground">
                        {t("noSubcategories")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* الشريط السفلي الثابت */}
          <div className="flex shrink-0 items-center justify-between gap-6 border-t border-border/70 bg-muted/30 px-7 py-3.5 text-xs font-normal text-foreground/80">
            <Link
              href={APP_ROUTES.CATEGORIES}
              onClick={close}
              className={cn(
                "group inline-flex items-center gap-2 rounded-md whitespace-nowrap transition-colors hover:text-primary",
                focusRing
              )}
            >
              <span>{t("allCategories")}</span>
              <ArrowIcon
                aria-hidden="true"
                className="size-3.5 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
              />
            </Link>

            <div className="flex items-center gap-5">
              {APP_ROUTES.ACCOUNT && (
                <Link
                  href={APP_ROUTES.ACCOUNT}
                  onClick={close}
                  className={cn(
                    "rounded-md whitespace-nowrap transition-colors hover:text-primary",
                    focusRing
                  )}
                >
                  {t("account")}
                </Link>
              )}
              {APP_ROUTES.WISHLIST && (
                <Link
                  href={APP_ROUTES.WISHLIST}
                  onClick={close}
                  className={cn(
                    "rounded-md whitespace-nowrap transition-colors hover:text-primary",
                    focusRing
                  )}
                >
                  {t("wishlist")}
                </Link>
              )}
            </div>
          </div>
        </LargeDialogContent>
      )}
    </LargeDialog>
  )
}
