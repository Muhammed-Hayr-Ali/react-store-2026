"use client"

import * as React from "react"
import { useLocale, useTranslations } from "next-intl"
import { Link, usePathname } from "@/i18n/navigation"
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Heart,
  ShoppingBag,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { APP_ROUTES } from "@/lib/config/app-routes"
import { CurrencySelector } from "./currency_selector"
import { LocaleSelector } from "./locale-selector"
import { ThemeSelector } from "./theme-selector"
import { AccountSelector } from "./account_selector"
import { StoreSearchInput } from "./store-search-input"
import { AppLogo } from "@/components/shared/app-logo"
import { useCart } from "@/lib/context/cart-context"
import { StoreCategoriesButton } from "./store-categories-button"
import { SimplifiedRootCategory } from "@/lib/actions/store/queries/get-all-categories"
import {
  focusRing,
  headerActionClass,
  hideScrollbar,
  isRtlLocale,
  navLinkClass,
  storeContainer,
} from "./store-header-shared"
import { MobileStoreCategoriesButton } from "./mobile_store-categories-button"

interface StoreHeaderProps {
  categories?: SimplifiedRootCategory[]
}

const scrollButtonClass =
  "hidden size-7 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background/80 text-foreground/80 transition-colors hover:bg-muted/70 hover:text-primary sm:flex"

/** شارة عدد السلة: تختفي عند الصفر وتُختصر فوق 99 */
function CartBadge({ count, className }: { count: number; className: string }) {
  if (count <= 0) return null
  return (
    <span
      aria-hidden="true"
      className={cn(
        "absolute flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-normal text-primary-foreground",
        className
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  )
}

export function StoreHeader({ categories = [] }: StoreHeaderProps) {
  const t = useTranslations("StoreHeader")
  const locale = useLocale()
  const isRtl = isRtlLocale(locale)
  const pathname = usePathname()

  const isCurrent = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`)

  const [showStickyNav, setShowStickyNav] = React.useState(false)
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)

  const mainHeaderRef = React.useRef<HTMLElement>(null)
  const stickyNavRef = React.useRef<HTMLElement>(null)
  const { totalItemsCount } = useCart()

  // aria-label يحجب محتوى الرابط، لذلك نضيف العدد إليه
  const cartLabel =
    totalItemsCount > 0
      ? `${t("cartAriaLabel")} (${totalItemsCount})`
      : t("cartAriaLabel")

  // فلترة التصنيفات الرئيسية النشطة فقط
  const rootCategories = React.useMemo(
    () =>
      categories.filter(
        (category) =>
          (!("parent_id" in category) || category.parent_id === null) &&
          (!("is_active" in category) || category.is_active !== false)
      ),
    [categories]
  )

  const updateScrollButtons = React.useCallback(() => {
    const el = stickyNavRef.current
    if (!el) return

    const maxScrollLeft = el.scrollWidth - el.clientWidth
    if (maxScrollLeft <= 2) {
      setCanScrollPrev(false)
      setCanScrollNext(false)
      return
    }

    // في RTL قد يكون scrollLeft سالباً أو موجباً حسب المتصفح
    const absScroll = Math.abs(el.scrollLeft)
    setCanScrollPrev(absScroll > 2)
    setCanScrollNext(absScroll < maxScrollLeft - 2)
  }, [])

  React.useEffect(() => {
    const handleScroll = () => {
      const headerHeight = mainHeaderRef.current?.offsetHeight ?? 136
      setShowStickyNav(window.scrollY > headerHeight)
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // ResizeObserver أدق من resize: يلتقط تغير الخطوط وعدد التصنيفات أيضاً
  React.useEffect(() => {
    const el = stickyNavRef.current
    updateScrollButtons()
    if (!el || typeof ResizeObserver === "undefined") return

    const observer = new ResizeObserver(updateScrollButtons)
    observer.observe(el)
    // نراقب العناصر أيضاً: تغير عرض المحتوى (كتحميل الخط) لا يغير حجم الحاوية
    Array.from(el.children).forEach((child) => observer.observe(child))
    return () => observer.disconnect()
  }, [updateScrollButtons, rootCategories, isRtl])

  const scrollCategories = (direction: "prev" | "next") => {
    const el = stickyNavRef.current
    if (!el) return

    const step = Math.max(180, Math.round(el.clientWidth * 0.6))
    // في RTL: الاتجاه للأمام (next) يكون سالباً، وللخلف (prev) يكون موجباً
    const delta =
      direction === "next" ? (isRtl ? -step : step) : isRtl ? step : -step

    el.scrollBy({ left: delta, behavior: "smooth" })
  }

  const hasOverflow = canScrollPrev || canScrollNext

  // التلاشي يظهر فقط في الجهة التي يوجد فيها محتوى مخفي
  const fadeLeft = isRtl ? canScrollNext : canScrollPrev
  const fadeRight = isRtl ? canScrollPrev : canScrollNext
  const fadeMask = `linear-gradient(to right, ${fadeLeft ? "transparent, black 16px" : "black, black 16px"}, ${fadeRight ? "black calc(100% - 16px), transparent" : "black calc(100% - 16px), black"})`

  const stickyFadeStyle: React.CSSProperties | undefined = hasOverflow
    ? { maskImage: fadeMask, WebkitMaskImage: fadeMask }
    : undefined

  return (
    <>
      {/* 1. الناف بار الأساسي الكبير */}
      <header
        ref={mainHeaderRef}
        className="w-full border-b border-border/60 bg-background font-normal"
      >
        <div className={storeContainer}>
          <div className="flex h-20 items-center justify-between gap-4 sm:gap-6">
            <Link
              href={APP_ROUTES.HOME}
              aria-label={t("home")}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-md text-primary transition-opacity hover:opacity-85",
                focusRing
              )}
            >
              <AppLogo aria-hidden="true" className="md:size-8" />
            </Link>

            <StoreSearchInput
              variant="default"
              className="hidden max-w-lg flex-1 md:block"
            />

            <div className="-me-3 flex shrink-0 items-center">
              <AccountSelector />

              <Link
                href={APP_ROUTES.WISHLIST}
                aria-label={t("wishlist")}
                className={cn(headerActionClass, "hidden sm:flex")}
              >
                <Heart aria-hidden="true" className="size-5 lg:size-4" />
                <span className="hidden lg:inline">{t("wishlist")}</span>
              </Link>

              <Link
                href={APP_ROUTES.CART}
                aria-label={cartLabel}
                className={headerActionClass}
              >
                <span className="relative">
                  <ShoppingBag
                    aria-hidden="true"
                    className="size-5 lg:size-4"
                  />
                  <CartBadge
                    count={totalItemsCount}
                    className="-inset-e-2 -top-1.5"
                  />
                </span>
                <span className="hidden lg:inline">{t("cart")}</span>
              </Link>
            </div>
          </div>

          <div className="pb-3 md:hidden">
            <StoreSearchInput variant="compact" />
          </div>
        </div>

        <div className="border-t border-border/60" />

        <div className={storeContainer}>
          <div
            className={cn(
              "-mx-3 flex h-13 items-center justify-between gap-2 overflow-x-auto px-3 sm:gap-4",
              hideScrollbar
            )}
          >
            <nav
              aria-label={t("categories")}
              className="-ms-2.5 flex shrink-0 items-center gap-2 text-[13px] font-normal"
            >
              <StoreCategoriesButton categories={rootCategories} />
              <MobileStoreCategoriesButton categories={rootCategories} />

              <span
                aria-hidden="true"
                className="mx-1 hidden h-4 w-px bg-border md:flex"
              />

              <Link
                href={APP_ROUTES.COLLECTIONS.NEWEST}
                aria-current={
                  isCurrent(APP_ROUTES.COLLECTIONS.NEWEST) ? "page" : undefined
                }
                className={cn(
                  navLinkClass,
                  "aria-[current=page]:bg-muted/70 aria-[current=page]:text-primary"
                )}
              >
                {t("newest")}
              </Link>

              <Link
                href={APP_ROUTES.COLLECTIONS.FEATURED}
                aria-current={
                  isCurrent(APP_ROUTES.COLLECTIONS.FEATURED)
                    ? "page"
                    : undefined
                }
                className={cn(
                  navLinkClass,
                  "aria-[current=page]:bg-muted/70 aria-[current=page]:text-primary"
                )}
              >
                {t("featured")}
              </Link>

              <Link
                href={APP_ROUTES.COLLECTIONS.OFFERS}
                aria-current={
                  isCurrent(APP_ROUTES.COLLECTIONS.OFFERS) ? "page" : undefined
                }
                className={cn(
                  "hidden h-9 items-center gap-1 rounded-lg px-2.5 text-primary transition-colors hover:bg-primary/10 aria-[current=page]:bg-primary/10 md:flex",
                  focusRing
                )}
              >
                <Flame aria-hidden="true" className="size-3.5" />
                <span>{t("offers")}</span>
              </Link>
            </nav>

            <div className="flex shrink-0 items-center gap-2">
              <CurrencySelector />
              <LocaleSelector />
              <ThemeSelector />
            </div>
          </div>
        </div>
      </header>

      {/* 2. الناف بار الثاني المدمج (Sticky) عند التمرير */}
      <div
        inert={!showStickyNav}
        className={cn(
          "fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/95 font-normal backdrop-blur-md transition-all duration-300 ease-out motion-reduce:transition-none",
          showStickyNav
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-full opacity-0"
        )}
      >
        <div className={storeContainer}>
          <div className="flex h-16 items-center justify-between gap-4 sm:gap-6">
            <Link
              href={APP_ROUTES.HOME}
              aria-label={t("home")}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-md text-primary transition-opacity hover:opacity-85",
                focusRing
              )}
            >
              <AppLogo size="sm" aria-hidden="true" />
            </Link>

            <StoreSearchInput variant="sticky" className="max-w-lg flex-1" />

            <Link
              href={APP_ROUTES.CART}
              aria-label={cartLabel}
              className={cn(
                "relative -me-2.5 flex size-10 shrink-0 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-muted/60 hover:text-primary",
                focusRing
              )}
            >
              <ShoppingBag aria-hidden="true" className="size-5" />
              <CartBadge count={totalItemsCount} className="inset-e-1 top-1" />
            </Link>
          </div>
        </div>

        <div className="border-t border-border/50" />

        {/* شريط التصنيفات الرئيسية مع أزرار التمرير */}
        <div className={storeContainer}>
          <div className="flex h-11 items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => scrollCategories("prev")}
              disabled={!canScrollPrev}
              aria-label={t("scrollPrev")}
              className={cn(
                scrollButtonClass,
                focusRing,
                !hasOverflow && "sm:hidden",
                !canScrollPrev && "pointer-events-none opacity-30"
              )}
            >
              {isRtl ? (
                <ChevronRight aria-hidden="true" className="size-3.5" />
              ) : (
                <ChevronLeft aria-hidden="true" className="size-3.5" />
              )}
            </button>

            <nav
              ref={stickyNavRef}
              onScroll={updateScrollButtons}
              aria-label={t("categories")}
              style={stickyFadeStyle}
              className={cn(
                // دون أزرار تمرير: نص أول تصنيف يحاذي الشعار
                "-mx-2.5 flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto scroll-smooth text-foreground/85 motion-reduce:scroll-auto",
                hasOverflow && "sm:mx-0",
                hideScrollbar
              )}
            >
              {rootCategories.map((category) => {
                const title =
                  isRtl && category.name_ar ? category.name_ar : category.name
                const href = `${APP_ROUTES.CATEGORIES}/${category.slug}`

                return (
                  <Link
                    key={category.id}
                    href={href}
                    aria-current={isCurrent(href) ? "page" : undefined}
                    className={cn(
                      "flex h-8 shrink-0 items-center rounded-lg px-2.5 whitespace-nowrap text-foreground/80 transition-colors hover:bg-muted/60 hover:text-primary aria-[current=page]:bg-primary/10 aria-[current=page]:text-primary",
                      focusRing
                    )}
                  >
                    {title}
                  </Link>
                )
              })}
            </nav>

            <button
              type="button"
              onClick={() => scrollCategories("next")}
              disabled={!canScrollNext}
              aria-label={t("scrollNext")}
              className={cn(
                scrollButtonClass,
                focusRing,
                !hasOverflow && "sm:hidden",
                !canScrollNext && "pointer-events-none opacity-30"
              )}
            >
              {isRtl ? (
                <ChevronLeft aria-hidden="true" className="size-3.5" />
              ) : (
                <ChevronRight aria-hidden="true" className="size-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
