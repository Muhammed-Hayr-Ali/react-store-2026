"use client"

import * as React from "react"
import { useLocale } from "next-intl"
import { usePathname, useRouter } from "@/i18n/navigation"
import { useTheme } from "next-themes"
import { CheckIcon, ChevronRight, Loader2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { sidebarConfig } from "./nav-config"
import { useCurrency } from "@/lib/context/currency-context"
import type { CurrencyCode } from "@/lib/actions/currency/types"
import { cn } from "@/lib/utils"

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
  const {
    currency: currentCurrency,
    setCurrency,
    isPending: isCurrencyPending,
  } = useCurrency()

  const [mounted, setMounted] = React.useState(false)

  // حالة اللغة المتفائلة عبر useOptimistic
  const [isLangPending, startLangTransition] = React.useTransition()
  const [optimisticLocale, setOptimisticLocale] = React.useOptimistic(
    currentLocale,
    (_current, next: string) => next
  )

  // حالة تحميل المظهر
  const [isThemePending, setIsThemePending] = React.useState(false)

  React.useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMounted(true)
    })
    return () => cancelAnimationFrame(frame)
  }, [])

  // 1. تغيير اللغة عبر next-intl
  const handleLanguageChange = (e: React.MouseEvent, newLocale: string) => {
    e.preventDefault()
    e.stopPropagation()

    if (newLocale === optimisticLocale || isLangPending) return

    startLangTransition(() => {
      setOptimisticLocale(newLocale)
      router.replace(pathname, { locale: newLocale })
    })
  }

  // 2. تغيير المظهر مع تأخير بسيط لإظهار المؤشر
  const handleThemeChange = (e: React.MouseEvent, newTheme: string) => {
    e.preventDefault()
    e.stopPropagation()

    if (newTheme === theme || isThemePending) return

    setIsThemePending(true)

    setTimeout(() => {
      setTheme(newTheme)
      setIsThemePending(false)
    }, 220)
  }

  // 3. تغيير العملة عبر السياق دون إغلاق القائمة
  const handleCurrencyChange = async (
    e: React.MouseEvent,
    newCurrency: CurrencyCode
  ) => {
    e.preventDefault()
    e.stopPropagation()

    if (newCurrency === currentCurrency || isCurrencyPending) return

    try {
      await setCurrency(newCurrency)
    } catch (error) {
      console.error("Failed to update currency:", error)
    }
  }

  const { language, appearance, currency } = sidebarConfig.preferences

  return (
    <div className="flex flex-col gap-0.5">
      {/* --- 1. قائمة اللغة --- */}
      <Collapsible className="group/pref-lang">
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
              <span>{language.name}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              {isLangPending ? (
                <Loader2Icon className="size-3.5 animate-spin text-primary" />
              ) : (
                mounted && (
                  <span className="text-[11px] font-medium uppercase">
                    {optimisticLocale}
                  </span>
                )
              )}
              <ChevronRight className="size-3.5 transition-transform duration-200 group-data-[state=open]/pref-lang:rotate-90 rtl:rotate-180" />
            </div>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-0.5 ps-6 pt-0.5">
          {language.options.map((opt) => {
            const isSelected = mounted && optimisticLocale === opt.value

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
                <div className="flex items-center">
                  {isSelected && !isLangPending ? (
                    <CheckIcon className="size-3.5 text-primary" />
                  ) : (
                    <span className="size-3.5" aria-hidden="true" />
                  )}
                </div>
              </Button>
            )
          })}
        </CollapsibleContent>
      </Collapsible>

      {/* --- 2. قائمة المظهر --- */}
      <Collapsible className="group/pref-theme">
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
              <span>{appearance.name}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              {isThemePending ? (
                <Loader2Icon className="size-3.5 animate-spin text-primary" />
              ) : (
                mounted && (
                  <span className="text-[11px] font-medium capitalize">
                    {theme}
                  </span>
                )
              )}
              <ChevronRight className="size-3.5 transition-transform duration-200 group-data-[state=open]/pref-theme:rotate-90 rtl:rotate-180" />
            </div>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-0.5 ps-6 pt-0.5">
          {appearance.options.map((opt) => {
            const isSelected = mounted && theme === opt.value
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
                  <span>{opt.label}</span>
                </div>
                <div className="flex items-center">
                  {isSelected && !isThemePending ? (
                    <CheckIcon className="size-3.5 text-primary" />
                  ) : (
                    <span className="size-3.5" aria-hidden="true" />
                  )}
                </div>
              </Button>
            )
          })}
        </CollapsibleContent>
      </Collapsible>

      {/* --- 3. قائمة العملة --- */}
      <Collapsible className="group/pref-curr">
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
              <currency.icon className="me-2 size-4 text-muted-foreground" />
              <span>{currency.name}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              {isCurrencyPending ? (
                <Loader2Icon className="size-3.5 animate-spin text-primary" />
              ) : (
                mounted && (
                  <span className="text-[11px] font-medium uppercase">
                    {currentCurrency}
                  </span>
                )
              )}
              <ChevronRight className="size-3.5 transition-transform duration-200 group-data-[state=open]/pref-curr:rotate-90 rtl:rotate-180" />
            </div>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-0.5 ps-6 pt-0.5">
          {currency.options.map((opt) => {
            const isSelected = mounted && currentCurrency === opt.value

            return (
              <Button
                key={opt.key}
                variant="ghost"
                size="sm"
                disabled={isCurrencyPending}
                onClick={(e) =>
                  handleCurrencyChange(e, opt.value as CurrencyCode)
                }
                className={cn(
                  "flex h-8 w-full items-center justify-between text-xs font-normal",
                  (!isSelected || isCurrencyPending) && "text-muted-foreground",
                  subItemClassName
                )}
              >
                <span>{opt.label}</span>
                <div className="flex items-center">
                  {isSelected && !isCurrencyPending ? (
                    <CheckIcon className="size-3.5 text-primary" />
                  ) : (
                    <span className="size-3.5" aria-hidden="true" />
                  )}
                </div>
              </Button>
            )
          })}
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
