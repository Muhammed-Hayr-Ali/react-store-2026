"use client"

/**
 * @file components/store/navigation/preferences-sub-nav.tsx
 * @description Sub-navigation for changing language, theme, and currency preferences with Arabic currency name support.
 */

import * as React from "react"
import { useLocale, useTranslations } from "next-intl"
import { usePathname, useRouter } from "@/i18n/navigation"
import { useTheme } from "next-themes"
import { CheckIcon, ChevronRight, Loader2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { PREFERENCES_CONFIG } from "./nav-config"
import { cn } from "@/lib/utils"
import { useCurrency } from "@/lib/context/currency-context"

interface PreferencesSubNavProps {
  itemClassName?: string
  subItemClassName?: string
}

export function PreferencesSubNav({
  itemClassName,
  subItemClassName,
}: PreferencesSubNavProps) {
  const router = useRouter()
  const pathname = usePathname()
  const currentLocale = useLocale()
  const { theme, setTheme } = useTheme()
  const { currentCurrency, setCurrency, currencies } = useCurrency()
  const t = useTranslations("Navigation.preferences")

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

  const handleLanguageChange = (e: React.MouseEvent, nextLocale: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (nextLocale === optimisticLocale || isLangPending) return

    startLangTransition(() => {
      setOptimisticLocale(nextLocale)
      router.replace(pathname, { locale: nextLocale })
    })
  }

  const handleThemeChange = (e: React.MouseEvent, nextTheme: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (nextTheme === theme || isThemePending) return

    setIsThemePending(true)
    setTimeout(() => {
      setTheme(nextTheme)
      setIsThemePending(false)
    }, 220)
  }

  const handleCurrencyChange = (
    e: React.MouseEvent,
    nextCurrencyCode: string
  ) => {
    e.preventDefault()
    e.stopPropagation()
    if (nextCurrencyCode === currentCurrency.code || isCurrencyPending) return

    setIsCurrencyPending(true)
    setTimeout(() => {
      setCurrency(nextCurrencyCode)
      setIsCurrencyPending(false)
    }, 200)
  }

  const { language, appearance, currency: currencyConfig } = PREFERENCES_CONFIG

  return (
    <div className="flex flex-col gap-0.5">
      {/* 1. اللغة */}
      <Collapsible className="group/lang">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            disabled={isLangPending}
            className={cn(
              "flex h-10 w-full items-center justify-between font-normal",
              itemClassName
            )}
          >
            <div className="flex items-center">
              <language.icon className="me-2 size-4 text-muted-foreground" />
              <span>{t(language.name)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              {isLangPending ? (
                <Loader2Icon className="size-3.5 animate-spin text-primary" />
              ) : (
                isMounted && (
                  <span className="text-[11px] font-medium uppercase">
                    {optimisticLocale}
                  </span>
                )
              )}
              <ChevronRight className="size-3.5 transition-transform duration-200 group-data-[state=open]/lang:rotate-90 rtl:rotate-180" />
            </div>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-0.5 ps-6 pt-0.5">
          {language.options.map((opt) => {
            const isSelected = isMounted && optimisticLocale === opt.value
            return (
              <Button
                key={opt.key}
                variant="ghost"
                size="sm"
                disabled={isLangPending}
                onClick={(e) => handleLanguageChange(e, opt.value)}
                className={cn(
                  "flex h-8 w-full items-center justify-between text-xs font-normal",
                  (!isSelected || isLangPending) && "text-muted-foreground",
                  subItemClassName
                )}
              >
                <span>{opt.label}</span>
                {isSelected && !isLangPending ? (
                  <CheckIcon className="size-3.5 text-primary" />
                ) : (
                  <span className="size-3.5" aria-hidden="true" />
                )}
              </Button>
            )
          })}
        </CollapsibleContent>
      </Collapsible>

      {/* 2. المظهر */}
      <Collapsible className="group/theme">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            disabled={isThemePending}
            className={cn(
              "flex h-10 w-full items-center justify-between font-normal",
              itemClassName
            )}
          >
            <div className="flex items-center">
              <appearance.icon className="me-2 size-4 text-muted-foreground" />
              <span>{t(appearance.name)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              {isThemePending ? (
                <Loader2Icon className="size-3.5 animate-spin text-primary" />
              ) : (
                isMounted && (
                  <span className="text-[11px] font-medium capitalize">
                    {theme ? t(theme) : ""}
                  </span>
                )
              )}
              <ChevronRight className="size-3.5 transition-transform duration-200 group-data-[state=open]/theme:rotate-90 rtl:rotate-180" />
            </div>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-0.5 ps-6 pt-0.5">
          {appearance.options.map((opt) => {
            const isSelected = isMounted && theme === opt.value
            const OptIcon = opt.icon
            return (
              <Button
                key={opt.key}
                variant="ghost"
                size="sm"
                disabled={isThemePending}
                onClick={(e) => handleThemeChange(e, opt.value)}
                className={cn(
                  "flex h-8 w-full items-center justify-between text-xs font-normal",
                  (!isSelected || isThemePending) && "text-muted-foreground",
                  subItemClassName
                )}
              >
                <div className="flex items-center gap-2">
                  {OptIcon && (
                    <OptIcon className="size-3.5 text-muted-foreground" />
                  )}
                  <span>{t(opt.key)}</span>
                </div>
                {isSelected && !isThemePending ? (
                  <CheckIcon className="size-3.5 text-primary" />
                ) : (
                  <span className="size-3.5" aria-hidden="true" />
                )}
              </Button>
            )
          })}
        </CollapsibleContent>
      </Collapsible>

      {/* 3. العملة */}
      <Collapsible className="group/currency">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            disabled={isCurrencyPending}
            className={cn(
              "flex h-10 w-full items-center justify-between font-normal",
              itemClassName
            )}
          >
            <div className="flex items-center">
              <currencyConfig.icon className="me-2 size-4 text-muted-foreground" />
              <span>{t(currencyConfig.name)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              {isCurrencyPending ? (
                <Loader2Icon className="size-3.5 animate-spin text-primary" />
              ) : (
                isMounted && (
                  <span className="text-[11px] font-medium uppercase">
                    {currentCurrency.code}
                  </span>
                )
              )}
              <ChevronRight className="size-3.5 transition-transform duration-200 group-data-[state=open]/currency:rotate-90 rtl:rotate-180" />
            </div>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-0.5 ps-6 pt-0.5">
          {currencies.map((curr) => {
            const isSelected = isMounted && currentCurrency.code === curr.code
            // التحقق من توفر الاسم العربي واستخدامه عند اختيار اللغة العربية
            const currencyDisplayName =
              currentLocale === "ar" && "name_ar" in curr && curr.name_ar
                ? (curr.name_ar as string)
                : curr.name

            return (
              <Button
                key={curr.code}
                variant="ghost"
                size="sm"
                disabled={isCurrencyPending}
                onClick={(e) => handleCurrencyChange(e, curr.code)}
                className={cn(
                  "flex h-8 w-full items-center justify-between text-xs font-normal",
                  (!isSelected || isCurrencyPending) && "text-muted-foreground",
                  subItemClassName
                )}
              >
                <div className="flex items-center gap-2">
                  <span>{currencyDisplayName}</span>
                  <span className="text-[10px] text-muted-foreground/80">
                    ({curr.symbol})
                  </span>
                </div>
                {isSelected && !isCurrencyPending ? (
                  <CheckIcon className="size-3.5 text-primary" />
                ) : (
                  <span className="size-3.5" aria-hidden="true" />
                )}
              </Button>
            )
          })}
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}