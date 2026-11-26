"use client"

import * as React from "react"
import { useLocale, useTranslations } from "next-intl"
import { ArrowLeft, ArrowRight, ChevronDown, LayoutGrid } from "lucide-react"

import { cn } from "@/lib/utils"
import { Link } from "@/i18n/navigation"
import { APP_ROUTES } from "@/lib/config/app-routes"
import type {
  SimplifiedRootCategory,
  StoreSubcategory,
} from "@/lib/actions/store/queries/get-all-categories"
import { focusRing, isRtlLocale } from "./store-header-shared"
import {
  MobileMenu,
  MobileMenuBody,
  MobileMenuFooter,
  MobileMenuHeader,
} from "@/components/ui/mobile-menu"

export interface MobileStoreCategoriesButtonProps {
  compact?: boolean
  className?: string
  categories?: SimplifiedRootCategory[]
}

const MOBILE_MAX_QUERY = "(max-width: 895.98px)"

/**
 * قائمة تصنيفات الجوال: مستوى واحد (أكورديون).
 * - تصنيف واحد مفتوح في كل مرة، والأول مفتوح افتراضياً.
 * - صورة مربعة 80px بجانب حتى 3 أسطر من التصنيفات الفرعية.
 */
const compactChipClass = cn(
  "inline-flex h-6 max-w-full items-center gap-1 rounded-md border border-border/60 bg-background px-2 text-[11px] leading-none text-foreground/80 transition-colors hover:bg-muted",
  focusRing
)

const footerLinkClass = cn(
  "inline-flex min-h-9 items-center gap-2 rounded-md whitespace-nowrap transition-colors hover:text-primary",
  focusRing
)

export function MobileStoreCategoriesButton({
  compact = false,
  className,
  categories = [],
}: MobileStoreCategoriesButtonProps) {
  const t = useTranslations("StoreHeader")
  const locale = useLocale()
  const baseId = React.useId()

  const isRtl = isRtlLocale(locale)
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight

  const [open, setOpen] = React.useState(false)
  const [openId, setOpenId] = React.useState<string | null>(null)

  const getCategoryTitle = React.useCallback(
    (name: string, nameAr: string | null) => (isRtl && nameAr ? nameAr : name),
    [isRtl]
  )

  // الروابط المخفية في الهيدر على الجوال
  const quickLinks = [
    { href: APP_ROUTES.COLLECTIONS.NEWEST, label: t("newest") },
    { href: APP_ROUTES.COLLECTIONS.FEATURED, label: t("featured") },
    { href: APP_ROUTES.COLLECTIONS.OFFERS, label: t("offers") },
  ]

  // بعد فتح بطاقة: نضمن بقاءها ظاهرة (قد تنزاح عند إغلاق بطاقة فوقها)
  const revealSection = (panel: HTMLElement) => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
    panel.parentElement?.scrollIntoView({
      block: "nearest",
      behavior: reduceMotion ? "auto" : "smooth",
    })
  }

  const openMenu = () => {
    // الأول مفتوح افتراضياً، ونعيد الضبط عند الفتح لا الإغلاق (لتفادي الوميض أثناء الإغلاق)
    setOpenId(categories[0]?.id ?? null)
    setOpen(true)
  }
  const close = React.useCallback(() => setOpen(false), [])

  // إغلاق قائمة الموبايل إذا وصل عرض الشاشة إلى 896px أو أكبر
  React.useEffect(() => {
    const mq = window.matchMedia(MOBILE_MAX_QUERY)
    const onChange = (e: MediaQueryListEvent) => {
      if (!e.matches) setOpen(false)
    }
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  // ظاهر وفعّال على كل القياسات الأقل من 896px، ويختفي فقط عند >= 896px
  const triggerClassName = cn(
    "inline-flex items-center rounded-lg px-2.5 font-normal text-foreground transition-colors hover:bg-muted/60 hover:text-primary min-[896px]:hidden",
    compact ? "h-8 gap-1" : "h-9 gap-1.5",
    focusRing,
    className
  )

  const triggerContent = (
    <>
      {!compact && (
        <LayoutGrid aria-hidden="true" className="size-3.5 text-primary" />
      )}
      <span>{t("categories")}</span>
    </>
  )

  if (categories.length === 0) {
    return (
      <Link href={APP_ROUTES.CATEGORIES} className={triggerClassName}>
        {triggerContent}
      </Link>
    )
  }

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        className={triggerClassName}
        onClick={openMenu}
      >
        {triggerContent}
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "size-3.5 text-muted-foreground transition-transform duration-200",
            open && "rotate-90 text-primary ltr:-rotate-90"
          )}
        />
      </button>

      <MobileMenu
        isOpen={open}
        // z أعلى من الشريط اللاصق (z-50)
        className="top-0 z-60 min-[896px]:hidden"
        onOpenChange={(next: boolean) => (next ? openMenu() : close())}
      >
        <MobileMenuHeader
          showCloseButton
          onClose={close}
          className="pt-[max(1rem,env(safe-area-inset-top))]"
        >
          <h2 className="text-lg font-medium text-foreground">
            {t("categories")}
          </h2>
        </MobileMenuHeader>

        <MobileMenuBody className="space-y-2 px-4 py-4">
          <ul className="grid grid-cols-3 gap-2">
            {quickLinks.map((item) => (
              <li key={item.href} className="min-w-0">
                <Link
                  href={item.href}
                  onClick={close}
                  className={cn(
                    "flex min-h-10 items-center justify-center rounded-lg border border-border/70 bg-background px-2 text-xs text-foreground/85 transition-colors hover:border-primary/50 hover:text-primary",
                    focusRing
                  )}
                >
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          {categories.map((category) => {
            const isOpen = openId === category.id
            const title = getCategoryTitle(category.name, category.name_ar)
            const href = `${APP_ROUTES.CATEGORIES}/${category.slug}`
            const panelId = `${baseId}-${category.id}`

            return (
              <section
                key={category.id}
                className={cn(
                  "overflow-hidden rounded-xl border transition-colors duration-200",
                  isOpen
                    ? "border-primary/40 bg-primary/5"
                    : "border-border/70 bg-background"
                )}
              >
                {/* رأس البطاقة: الاسم + السهم */}
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenId(isOpen ? null : category.id)}
                    className={cn(
                      "flex min-h-12 w-full items-center justify-between gap-3 px-3.5 py-2.5 text-start text-[13px] transition-colors hover:bg-muted/40",
                      isOpen
                        ? "font-medium text-foreground"
                        : "font-normal text-foreground/85",
                      focusRing,
                      "focus-visible:ring-offset-0 focus-visible:ring-inset"
                    )}
                  >
                    <span className="min-w-0 flex-1 truncate">{title}</span>

                    <ChevronDown
                      aria-hidden="true"
                      className={cn(
                        "size-4 shrink-0 text-foreground/50 transition-transform duration-200",
                        isOpen && "rotate-180 text-primary"
                      )}
                    />
                  </button>
                </h3>

                {/* المحتوى عند الفتح: الصورة والتصنيفات الفرعية على نفس السطر */}
                <div
                  id={panelId}
                  role="region"
                  aria-label={title}
                  inert={!isOpen}
                  onTransitionEnd={(event) => {
                    if (isOpen && event.target === event.currentTarget) {
                      revealSection(event.currentTarget)
                    }
                  }}
                  className={cn(
                    "grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none",
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  )}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div className="flex items-start gap-2.5 border-t border-border/50 p-3">
                      {/* صورة التصنيف بنسبة 1:1 */}
                      <Link
                        href={href}
                        onClick={close}
                        // رابط مكرر لزر "عرض الكل"
                        tabIndex={-1}
                        aria-hidden="true"
                        className={cn(
                          "group relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-muted/40",
                          focusRing
                        )}
                      >
                        {category.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={category.image_url}
                            alt={category.image_alt || title}
                            loading="lazy"
                            decoding="async"
                            className="size-full object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none"
                          />
                        ) : (
                          <LayoutGrid
                            aria-hidden="true"
                            className="size-6 text-muted-foreground/45"
                          />
                        )}
                      </Link>

                      {/* التصنيفات الفرعية: 3 أسطر = ارتفاع الصورة */}
                      <div className="flex min-h-20 min-w-0 flex-1 flex-wrap content-center items-center gap-1">
                        {category.subcategories.length > 0 ? (
                          category.subcategories.map(
                            (sub: StoreSubcategory) => (
                              <Link
                                key={sub.id}
                                href={`${href}/${sub.slug}`}
                                onClick={close}
                                className={compactChipClass}
                              >
                                <span className="truncate leading-normal">
                                  {getCategoryTitle(sub.name, sub.name_ar)}
                                </span>
                              </Link>
                            )
                          )
                        ) : (
                          <p className="w-full text-[11px] font-normal text-muted-foreground">
                            {t("noSubcategories")}
                          </p>
                        )}

                        {/* عرض الكل في نهاية القائمة */}
                        <Link
                          href={href}
                          onClick={close}
                          className={cn(
                            compactChipClass,
                            "border-primary/40 bg-primary/10 text-primary hover:bg-primary/15"
                          )}
                        >
                          <span>{t("viewAll")}</span>
                          <ArrowIcon aria-hidden="true" className="size-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )
          })}
        </MobileMenuBody>

        {/* الشريط السفلي: نفس شريط سطح المكتب */}
        <MobileMenuFooter className="border-t border-border/70 bg-muted/30 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-between gap-4 text-xs font-normal text-foreground/80">
            <Link
              href={APP_ROUTES.CATEGORIES}
              onClick={close}
              className={footerLinkClass}
            >
              <span>{t("allCategories")}</span>
              <ArrowIcon aria-hidden="true" className="size-3.5" />
            </Link>

            <div className="flex items-center gap-5">
              {APP_ROUTES.ACCOUNT && (
                <Link
                  href={APP_ROUTES.ACCOUNT}
                  onClick={close}
                  className={footerLinkClass}
                >
                  {t("account")}
                </Link>
              )}
              {APP_ROUTES.WISHLIST && (
                <Link
                  href={APP_ROUTES.WISHLIST}
                  onClick={close}
                  className={footerLinkClass}
                >
                  {t("wishlist")}
                </Link>
              )}
            </div>
          </div>
        </MobileMenuFooter>
      </MobileMenu>
    </>
  )
}
