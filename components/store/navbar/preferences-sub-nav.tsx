"use client"

import * as React from "react"
import Link from "next/link"
import { useLocale, useTranslations } from "next-intl"
import { usePathname, useRouter } from "@/i18n/navigation"
import { useTheme } from "next-themes"
import {
  Check,
  ChevronDown,
  Flame,
  Globe,
  Heart,
  LayoutGrid,
  Loader2Icon,
  Menu,
  Monitor,
  SearchIcon,
  ShoppingBag,
  UserIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { useCurrency } from "@/lib/context/currency-context"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  PreferenceOption,
  PREFERENCES_CONFIG,
  SUPPORTED_CURRENCIES,
} from "@/components/store/store-header/store-header-config"

export interface StoreCategoryItem {
  id: string
  name: string
  slug: string
}

interface CurrencyItem {
  code: string
  name: string
  name_ar?: string
  symbol: string
}

/* -------------------------------------------------------------------------- */
/* هوك مشترك لإدارة دوال وحالات اللغة والثيم والعملة                          */
/* -------------------------------------------------------------------------- */
function useStorePreferences() {
  const router = useRouter()
  const pathname = usePathname()
  const currentLocale = useLocale()
  const { theme, setTheme } = useTheme()
  const { currentCurrency, setCurrency } = useCurrency()

  const [isMounted, setIsMounted] = React.useState(false)
  const [isLangPending, startLangTransition] = React.useTransition()
  const [optimisticLocale, setOptimisticLocale] = React.useOptimistic(
    currentLocale,
    (_current, next: string) => next
  )
  const [isThemePending, setIsThemePending] = React.useState(false)
  const [isCurrencyPending, setIsCurrencyPending] = React.useState(false)

  React.useEffect(() => {
    const frame = requestAnimationFrame(() => setIsMounted(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  const handleLanguageChange = (nextLocale: string) => {
    if (nextLocale === optimisticLocale || isLangPending) return

    startLangTransition(() => {
      setOptimisticLocale(nextLocale)
      router.replace(pathname, { locale: nextLocale })
    })
  }

  const handleThemeChange = (nextTheme: string) => {
    if (nextTheme === theme || isThemePending) return

    setIsThemePending(true)
    setTimeout(() => {
      setTheme(nextTheme)
      setIsThemePending(false)
    }, 220)
  }

  const handleCurrencyChange = (nextCurrencyCode: string) => {
    if (nextCurrencyCode === currentCurrency.code || isCurrencyPending) return

    setIsCurrencyPending(true)
    setTimeout(() => {
      setCurrency(nextCurrencyCode)
      setIsCurrencyPending(false)
    }, 200)
  }

  return {
    isMounted,
    currentLocale,
    optimisticLocale,
    isLangPending,
    handleLanguageChange,
    theme,
    isThemePending,
    handleThemeChange,
    currentCurrency: currentCurrency as CurrencyItem,
    isCurrencyPending,
    handleCurrencyChange,
  }
}

const getTriggerClass = (compact = false, disabled = false) =>
  cn(
    "flex items-center gap-1.5 rounded-lg bg-muted/60 px-2.5 text-[11px] font-normal text-foreground/85 transition-colors hover:bg-muted hover:text-foreground",
    compact ? "h-8" : "h-9",
    disabled && "pointer-events-none opacity-70"
  )

const getMenuItemClass = (isSelected: boolean) =>
  cn(
    "flex min-h-8 w-full items-center justify-between gap-2.5 rounded-md px-2.5 py-1.5 text-xs font-normal transition-colors hover:bg-muted",
    isSelected ? "bg-muted/70 text-primary" : "text-foreground/85"
  )

/* -------------------------------------------------------------------------- */
/* 1. عنصر زر اختيار العملة (منفصل ومستقل)                                     */
/* -------------------------------------------------------------------------- */
interface CurrencySelectorProps {
  compact?: boolean
}

export function CurrencySelector({ compact = false }: CurrencySelectorProps) {
  const [open, setOpen] = React.useState(false)
  const t = useTranslations("Navigation.preferences")
  const {
    isMounted,
    currentLocale,
    currentCurrency,
    isCurrencyPending,
    handleCurrencyChange,
  } = useStorePreferences()

  const currencies = Object.values(SUPPORTED_CURRENCIES) as CurrencyItem[]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={isCurrencyPending}
          className={getTriggerClass(compact, isCurrencyPending)}
          aria-label={t(PREFERENCES_CONFIG.currency.name)}
        >
          {isCurrencyPending ? (
            <Loader2Icon className="size-3 animate-spin text-primary" />
          ) : (
            <span className="text-primary">{currentCurrency.symbol}</span>
          )}
          <span>{isMounted ? currentCurrency.code : "SYP"}</span>
          <ChevronDown className="size-3 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-1.5 font-normal">
        <ScrollArea className="h-64 pe-1">
          <div className="space-y-1">
            {currencies.map((curr) => {
              const isSelected = isMounted && currentCurrency.code === curr.code
              const displayName =
                currentLocale === "ar" && curr.name_ar
                  ? curr.name_ar
                  : curr.name

              return (
                <button
                  key={curr.code}
                  type="button"
                  disabled={isCurrencyPending}
                  onClick={() => {
                    handleCurrencyChange(curr.code)
                    setOpen(false)
                  }}
                  className={getMenuItemClass(isSelected)}
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span className="w-7 shrink-0 text-start text-[11px] text-muted-foreground">
                      {curr.symbol}
                    </span>
                    <span className="truncate">{displayName}</span>
                  </span>
                  {isSelected && !isCurrencyPending && (
                    <Check className="size-3.5 shrink-0 text-primary" />
                  )}
                </button>
              )
            })}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}

/* -------------------------------------------------------------------------- */
/* 2. عنصر زر اختيار اللغة (منفصل ومستقل)                                     */
/* -------------------------------------------------------------------------- */
interface LocaleSelectorProps {
  compact?: boolean
}

export function LocaleSelector({ compact = false }: LocaleSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const t = useTranslations("Navigation.preferences")
  const { isMounted, optimisticLocale, isLangPending, handleLanguageChange } =
    useStorePreferences()

  const { language } = PREFERENCES_CONFIG
  const activeOption =
    language.options.find((opt) => opt.value === optimisticLocale) ??
    language.options[0]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={isLangPending}
          className={getTriggerClass(compact, isLangPending)}
          aria-label={t(language.name)}
        >
          {isLangPending ? (
            <Loader2Icon className="size-3 animate-spin text-primary" />
          ) : (
            <Globe className="size-3.5 text-muted-foreground" />
          )}
          <span>
            {isMounted ? (activeOption?.label ?? optimisticLocale) : "العربية"}
          </span>
          <ChevronDown className="size-3 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-44 p-1.5 font-normal">
        <div className="space-y-1">
          {language.options.map((opt: PreferenceOption) => {
            const isSelected = isMounted && optimisticLocale === opt.value
            return (
              <button
                key={opt.key}
                type="button"
                disabled={isLangPending}
                onClick={() => {
                  handleLanguageChange(opt.value)
                  setOpen(false)
                }}
                className={getMenuItemClass(isSelected)}
              >
                <span>{opt.label}</span>
                {isSelected && !isLangPending && (
                  <Check className="size-3.5 shrink-0 text-primary" />
                )}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}

/* -------------------------------------------------------------------------- */
/* 3. عنصر زر اختيار المظهر / الثيم (منفصل ومستقل)                            */
/* -------------------------------------------------------------------------- */
interface ThemeSelectorProps {
  compact?: boolean
}

export function ThemeSelector({ compact = false }: ThemeSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const t = useTranslations("Navigation.preferences")
  const { isMounted, theme, isThemePending, handleThemeChange } =
    useStorePreferences()

  const { appearance } = PREFERENCES_CONFIG
  const activeThemeKey = theme ?? "system"
  const activeOption =
    appearance.options.find((opt) => opt.value === activeThemeKey) ??
    appearance.options[1] ??
    appearance.options[0]
  const ActiveIcon = activeOption?.icon ?? Monitor

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={isThemePending}
          className={getTriggerClass(compact, isThemePending)}
          aria-label={t(appearance.name)}
        >
          {isThemePending ? (
            <Loader2Icon className="size-3 animate-spin text-primary" />
          ) : (
            <ActiveIcon className="size-3.5 text-muted-foreground" />
          )}
          <span>{isMounted ? t(activeOption?.key ?? "system") : "النظام"}</span>
          <ChevronDown className="size-3 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-40 p-1.5 font-normal">
        <div className="space-y-1">
          {appearance.options.map((opt: PreferenceOption) => {
            const isSelected = isMounted && theme === opt.value
            const OptIcon = opt.icon
            return (
              <button
                key={opt.key}
                type="button"
                disabled={isThemePending}
                onClick={() => {
                  handleThemeChange(opt.value)
                  setOpen(false)
                }}
                className={getMenuItemClass(isSelected)}
              >
                <span className="flex items-center gap-2.5">
                  {OptIcon && (
                    <OptIcon className="size-3.5 shrink-0 text-muted-foreground" />
                  )}
                  <span>{t(opt.key)}</span>
                </span>
                {isSelected && !isThemePending && (
                  <Check className="size-3.5 shrink-0 text-primary" />
                )}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}

/* -------------------------------------------------------------------------- */
/* 4. مكوّن الهيدر الرئيسي للمتجر (StoreHeader)                               */
/* -------------------------------------------------------------------------- */
interface StoreHeaderProps {
  cartCount?: number
  categories?: StoreCategoryItem[]
  onOpenMenu?: () => void
}

export function StoreHeader({
  cartCount = 0,
  categories = [],
  onOpenMenu,
}: StoreHeaderProps) {
  const [showStickyNav, setShowStickyNav] = React.useState(false)
  const mainHeaderRef = React.useRef<HTMLElement>(null)

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
        {/* الصف العلوي */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between gap-4 sm:gap-6">
            <div className="flex shrink-0 items-center gap-2.5">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onOpenMenu}
                className="size-10 rounded-xl lg:hidden"
                aria-label="القائمة"
              >
                <Menu className="size-4" />
              </Button>

              <Link
                href="/"
                className="text-lg font-normal tracking-tight text-primary"
              >
                Marketna
              </Link>
            </div>

            <form
              action="/products"
              method="GET"
              className="relative hidden max-w-lg flex-1 md:block"
            >
              <input
                type="search"
                name="q"
                placeholder="ابحث عن منتج..."
                className="h-11 w-full rounded-xl border border-border/80 bg-muted/40 ps-4 pe-10 text-xs font-normal transition-all outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:bg-background focus:ring-2 focus:ring-primary/15"
              />
              <SearchIcon className="pointer-events-none absolute inset-e-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            </form>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <Link
                href="/account"
                className="flex h-10 items-center gap-2 rounded-xl px-3 text-xs font-normal text-foreground/85 transition-colors hover:bg-muted/60 hover:text-primary"
              >
                <UserIcon className="size-4" />
                <span className="hidden sm:inline">الحساب</span>
              </Link>

              <Link
                href="/wishlist"
                className="flex h-10 items-center gap-2 rounded-xl px-3 text-xs font-normal text-foreground/85 transition-colors hover:bg-muted/60 hover:text-primary"
              >
                <Heart className="size-4" />
                <span className="hidden lg:inline">المنتجات المحفوظة</span>
              </Link>

              <Link
                href="/cart"
                aria-label="سلة التسوق"
                className="flex h-10 items-center gap-2 rounded-xl px-3 text-xs font-normal text-foreground/85 transition-colors hover:bg-muted/60 hover:text-primary"
              >
                <span className="relative">
                  <ShoppingBag className="size-4" />
                  <span className="absolute -inset-e-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-normal text-primary-foreground">
                    {cartCount}
                  </span>
                </span>
                <span className="hidden sm:inline">سلة التسوق</span>
              </Link>
            </div>
          </div>

          <div className="pb-3 md:hidden">
            <form action="/products" method="GET" className="relative">
              <input
                type="search"
                name="q"
                placeholder="ابحث عن منتج..."
                className="h-10 w-full rounded-xl border border-border/80 bg-muted/40 ps-3.5 pe-10 text-xs font-normal outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:bg-background"
              />
              <SearchIcon className="pointer-events-none absolute inset-e-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            </form>
          </div>
        </div>

        <div className="border-t border-border/60" />

        {/* الصف السفلي */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-13 [scrollbar-width:none] items-center justify-between gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden">
            <nav className="flex shrink-0 items-center gap-2 text-xs font-normal">
              <Link
                href="/categories"
                className="flex h-9 items-center gap-1.5 rounded-lg px-2.5 font-normal text-foreground transition-colors hover:bg-muted/60 hover:text-primary"
              >
                <LayoutGrid className="size-3.5 text-primary" />
                <span>أقسام المتجر</span>
              </Link>

              <span className="mx-1 h-4 w-px bg-border" />

              <Link
                href="/products?sort=newest"
                className="flex h-9 items-center rounded-lg px-2.5 text-foreground/80 transition-colors hover:bg-muted/60 hover:text-primary"
              >
                أحدث المنتجات
              </Link>

              <Link
                href="/products?featured=true"
                className="flex h-9 items-center rounded-lg px-2.5 text-foreground/80 transition-colors hover:bg-muted/60 hover:text-primary"
              >
                المنتجات المميزة
              </Link>

              <Link
                href="/products?offers=true"
                className="flex h-9 items-center gap-1 rounded-lg px-2.5 font-normal text-primary transition-colors hover:bg-primary/10"
              >
                <Flame className="size-3.5" />
                <span>عروض خاصة</span>
              </Link>

              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="flex h-9 items-center rounded-lg px-2.5 text-foreground/80 transition-colors hover:bg-muted/60 hover:text-primary"
                >
                  {category.name}
                </Link>
              ))}
            </nav>

            <div className="hidden shrink-0 items-center gap-2 lg:flex">
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
        {/* الصف العلوي المصغّر */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4 sm:gap-6">
            <div className="flex shrink-0 items-center gap-2.5">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onOpenMenu}
                className="size-9 rounded-xl"
                aria-label="القائمة"
              >
                <Menu className="size-4" />
              </Button>

              <Link
                href="/"
                className="text-base font-normal tracking-tight text-primary"
              >
                Marketna
              </Link>
            </div>

            <form
              action="/products"
              method="GET"
              className="relative max-w-lg flex-1"
            >
              <input
                type="search"
                name="q"
                placeholder="ابحث عن منتج..."
                className="h-10 w-full rounded-xl border border-border/80 bg-background ps-3.5 pe-9 text-xs font-normal transition-all outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
              />
              <SearchIcon className="pointer-events-none absolute inset-e-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            </form>

            <Link
              href="/cart"
              aria-label="سلة التسوق"
              className="relative flex size-10 shrink-0 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-muted/60 hover:text-primary"
            >
              <ShoppingBag className="size-5" />
              <span className="absolute inset-e-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-normal text-primary-foreground">
                {cartCount}
              </span>
            </Link>
          </div>
        </div>

        <div className="border-t border-border/50" />

        {/* الصف السفلي المصغّر */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-11 [scrollbar-width:none] items-center justify-between gap-4 overflow-x-auto text-[11px] font-normal [&::-webkit-scrollbar]:hidden">
            <nav className="flex shrink-0 items-center gap-1.5 text-foreground/85">
              <Link
                href="/categories"
                className="flex h-8 items-center rounded-lg px-2.5 text-foreground transition-colors hover:bg-muted/60 hover:text-primary"
              >
                أقسام المتجر
              </Link>
              <Link
                href="/products?sort=newest"
                className="flex h-8 items-center rounded-lg px-2.5 transition-colors hover:bg-muted/60 hover:text-primary"
              >
                أحدث المنتجات
              </Link>
              <Link
                href="/products?featured=true"
                className="flex h-8 items-center rounded-lg px-2.5 transition-colors hover:bg-muted/60 hover:text-primary"
              >
                المنتجات المميزة
              </Link>
              <Link
                href="/products?offers=true"
                className="flex h-8 items-center rounded-lg px-2.5 text-primary transition-colors hover:bg-primary/10"
              >
                عروض خاصة
              </Link>
            </nav>

            <div className="flex shrink-0 items-center gap-2">
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
