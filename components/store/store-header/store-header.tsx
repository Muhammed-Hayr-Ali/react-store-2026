"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import {
  Flame,
  Heart,
  LayoutGrid,
  Menu,
  SearchIcon,
  ShoppingBag,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { APP_ROUTES } from "@/lib/config/app-routes"
import { CurrencySelector } from "./currency_selector"
import { LocaleSelector } from "./locale-selector"
import { ThemeSelector } from "./theme-selector"
import { Button } from "@/components/ui/button"
import { AccountSelector } from "./account_selector"
import MenuButton from "@/components/shared/menu_button"
import { AppLogo } from "@/components/shared/app-logo"
import { useCart } from "@/lib/context/cart-context"

export interface StoreCategoryItem {
  id: string
  name: string
  slug: string
}

/* -------------------------------------------------------------------------- */
/* 4. مكوّن الهيدر الرئيسي للمتجر (StoreHeader)                               */
/* -------------------------------------------------------------------------- */
interface StoreHeaderProps {
  cartCount?: number
  categories?: StoreCategoryItem[]
  onOpenMenu?: () => void
}

export function StoreHeader({ categories = [], onOpenMenu }: StoreHeaderProps) {
  const t = useTranslations("StoreHeader")
  const [showStickyNav, setShowStickyNav] = React.useState(false)
  const [menuIsOpen, setMenuIsOpen] = React.useState(false)
  const mainHeaderRef = React.useRef<HTMLElement>(null)
  const { totalItemsCount } = useCart()

  React.useEffect(() => {
    const handleScroll = () => {
      const headerHeight = mainHeaderRef.current?.offsetHeight ?? 136
      setShowStickyNav(window.scrollY > headerHeight)
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      {/* 1. الناف بار الأساسي الكبير */}
      <header
        ref={mainHeaderRef}
        className="w-full border-b border-border/60 bg-background font-normal"
      >
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between gap-4 sm:gap-6">
            <div className="flex shrink-0 items-center gap-2.5">
              <MenuButton
                isOpen={menuIsOpen}
                onClick={function (): void {
                  setMenuIsOpen(!menuIsOpen)
                }}
                className="block sm:hidden"
              />

              <Link
                href={APP_ROUTES.HOME}
                aria-label={t("home")}
                className="inline-flex shrink-0 items-center gap-2 text-primary transition-opacity hover:opacity-85"
              >
                <AppLogo aria-hidden="true" />
                <span className="sr-only">{t("home")}</span>
              </Link>
            </div>

            <form
              action={APP_ROUTES.SEARCH}
              method="GET"
              className="relative hidden max-w-lg flex-1 sm:block"
            >
              <input
                type="search"
                name="q"
                placeholder={t("searchPlaceholder")}
                className="h-11 w-full rounded-xl border border-border/80 bg-muted/40 ps-4 pe-10 text-xs font-normal transition-all outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:bg-background focus:ring-2 focus:ring-primary/15"
              />
              <SearchIcon className="pointer-events-none absolute inset-e-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            </form>

            <div className="flex shrink-0 items-center">
              <AccountSelector />

              <Link
                href={APP_ROUTES.WISHLIST}
                className="hidden h-10 items-center gap-2 rounded-xl px-3 text-xs font-normal text-foreground/85 transition-colors hover:bg-muted/60 hover:text-primary sm:flex"
              >
                <Heart className="size-5 lg:size-4" />
                <span className="hidden lg:inline">{t("wishlist")}</span>
              </Link>

              <Link
                href={APP_ROUTES.CART}
                aria-label={t("cartAriaLabel")}
                className="flex h-10 items-center gap-2 rounded-xl px-3 text-xs font-normal text-foreground/85 transition-colors hover:bg-muted/60 hover:text-primary"
              >
                <span className="relative">
                  <ShoppingBag className="size-5 lg:size-4" />
                  <span className="absolute -inset-e-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-normal text-primary-foreground">
                    {totalItemsCount}
                  </span>
                </span>
                <span className="hidden lg:inline">{t("cart")}</span>
              </Link>
            </div>
          </div>

          <div className="pb-3 sm:hidden">
            <form action={APP_ROUTES.SEARCH} method="GET" className="relative">
              <input
                type="search"
                name="q"
                placeholder={t("searchPlaceholder")}
                className="h-10 w-full rounded-xl border border-border/80 bg-muted/40 ps-3.5 pe-10 text-xs font-normal outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:bg-background"
              />
              <SearchIcon className="pointer-events-none absolute inset-e-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            </form>
          </div>
        </div>

        <div className="border-t border-border/60" />

        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-13 scrollbar-none items-center justify-between gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden">
            <nav className="flex shrink-0 items-center gap-2 text-xs font-normal">
              <Link
                href={APP_ROUTES.CATEGORIES}
                className="flex h-9 items-center gap-1.5 rounded-lg px-2.5 font-normal text-foreground transition-colors hover:bg-muted/60 hover:text-primary"
              >
                <LayoutGrid className="size-3.5 text-primary" />
                <span>{t("categories")}</span>
              </Link>

              <span className="mx-1 h-4 w-px bg-border" />

              <Link
                href={APP_ROUTES.COLLECTIONS.NEWEST}
                className="flex h-9 items-center rounded-lg px-2.5 text-foreground/80 transition-colors hover:bg-muted/60 hover:text-primary"
              >
                {t("newest")}
              </Link>

              <Link
                href={APP_ROUTES.COLLECTIONS.FEATURED}
                className="flex h-9 items-center rounded-lg px-2.5 text-foreground/80 transition-colors hover:bg-muted/60 hover:text-primary"
              >
                {t("featured")}
              </Link>

              <Link
                href={APP_ROUTES.COLLECTIONS.OFFERS}
                className="flex h-9 items-center gap-1 rounded-lg px-2.5 font-normal text-primary transition-colors hover:bg-primary/10"
              >
                <Flame className="size-3.5" />
                <span>{t("offers")}</span>
              </Link>

              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`${APP_ROUTES.CATEGORIES}/${category.slug}`}
                  className="flex h-9 items-center rounded-lg px-2.5 text-foreground/80 transition-colors hover:bg-muted/60 hover:text-primary"
                >
                  {category.name}
                </Link>
              ))}
            </nav>

            <div className="shrink-0 items-center gap-2 flex justify-around">
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
          "fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/95 font-normal backdrop-blur-md transition-all duration-300 ease-out",
          showStickyNav
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-full opacity-0"
        )}
      >
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4 sm:gap-6">
            <div className="flex shrink-0 items-center gap-2.5">
              <MenuButton
                isOpen={menuIsOpen}
                onClick={function (): void {
                  setMenuIsOpen(!menuIsOpen)
                }}
                className="block sm:hidden"
              />

              <Link
                href={APP_ROUTES.HOME}
                aria-label={t("home")}
                className="inline-flex shrink-0 items-center gap-2 text-primary transition-opacity hover:opacity-85"
              >
                <AppLogo size="sm" />
                <span className="sr-only">{t("home")}</span>
              </Link>
            </div>

            <form
              action={APP_ROUTES.SEARCH}
              method="GET"
              className="relative max-w-lg flex-1"
            >
              <input
                type="search"
                name="q"
                placeholder={t("searchPlaceholder")}
                className="h-10 w-full rounded-xl border border-border/80 bg-background ps-3.5 pe-9 text-xs font-normal transition-all outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
              />
              <SearchIcon className="pointer-events-none absolute inset-e-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            </form>

            <Link
              href={APP_ROUTES.CART}
              aria-label={t("cartAriaLabel")}
              className="relative flex size-10 shrink-0 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-muted/60 hover:text-primary"
            >
              <ShoppingBag className="size-5" />
              <span className="absolute inset-e-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-normal text-primary-foreground">
                {totalItemsCount}
              </span>
            </Link>
          </div>
        </div>

        <div className="border-t border-border/50" />

        <div className="container mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
          <div className="flex h-11 scrollbar-none items-center justify-between gap-4 overflow-x-auto text-[11px] font-normal [&::-webkit-scrollbar]:hidden">
            <nav className="flex shrink-0 items-center gap-1.5 text-foreground/85">
              <Link
                href={APP_ROUTES.CATEGORIES}
                className="flex h-8 items-center rounded-lg px-2.5 text-foreground transition-colors hover:bg-muted/60 hover:text-primary"
              >
                {t("categories")}
              </Link>

              <Link
                href={APP_ROUTES.COLLECTIONS.NEWEST}
                className="flex h-8 items-center rounded-lg px-2.5 transition-colors hover:bg-muted/60 hover:text-primary"
              >
                {t("newest")}
              </Link>
              <Link
                href={APP_ROUTES.COLLECTIONS.FEATURED}
                className="flex h-8 items-center rounded-lg px-2.5 transition-colors hover:bg-muted/60 hover:text-primary"
              >
                {t("featured")}
              </Link>
              <Link
                href={APP_ROUTES.COLLECTIONS.OFFERS}
                className="flex h-8 items-center rounded-lg px-2.5 text-primary transition-colors hover:bg-primary/10"
              >
                {t("offers")}
              </Link>
            </nav>

            <div className="hidden md:flex shrink-0 items-center gap-2">
              <CurrencySelector compact />
              <LocaleSelector compact />
              <ThemeSelector compact />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
