"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
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
  onSelect?: () => void
  itemClassName?: string
  subItemClassName?: string
}

export function PreferencesSubNav({
  onSelect,
  itemClassName,
  subItemClassName,
}: PreferencesSubNavProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const {
    currency: currentCurrency,
    setCurrency,
    isPending: isCurrencyPending,
  } = useCurrency()

  const [mounted, setMounted] = React.useState(false)
  const [isLangPending, startLangTransition] = React.useTransition()
  const [pendingLangKey, setPendingLangKey] = React.useState<string | null>(
    null
  )
  const [targetCurrencyKey, setTargetCurrencyKey] = React.useState<
    string | null
  >(null)

  React.useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMounted(true)
    })
    return () => cancelAnimationFrame(frame)
  }, [])

  // 1. تحديد اللغة الحالية
  const segments = pathname.split("/").filter(Boolean)
  const currentLocale =
    segments.length > 0 && segments[0].length === 2 ? segments[0] : "en"

  // 2. إدارة تغيير اللغة
  const handleLanguageChange = (newLocale: string) => {
    if (newLocale === currentLocale || isLangPending) {
      onSelect?.()
      return
    }

    setPendingLangKey(newLocale)
    startLangTransition(() => {
      const newPathname =
        segments.length > 0 && segments[0].length === 2
          ? `/${newLocale}/${segments.slice(1).join("/")}`
          : `/${newLocale}${pathname}`

      router.replace(newPathname)
      router.refresh()
      onSelect?.()
    })
  }

  // 3. إدارة تغيير المظهر
  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)
    onSelect?.()
  }

  // 4. إدارة تغيير العملة عبر دالة السياق
  const handleCurrencyChange = async (newCurrency: CurrencyCode) => {
    if (newCurrency === currentCurrency || isCurrencyPending) {
      onSelect?.()
      return
    }

    setTargetCurrencyKey(newCurrency)
    try {
      await setCurrency(newCurrency)
      onSelect?.()
    } finally {
      setTargetCurrencyKey(null)
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
              {mounted && (
                <span className="text-[11px] font-medium uppercase">
                  {currentLocale}
                </span>
              )}
              <ChevronRight className="size-3.5 transition-transform duration-200 group-data-[state=open]/pref-lang:rotate-90 rtl:rotate-180" />
            </div>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-0.5 ps-6 pt-0.5">
          {language.options.map((opt) => {
            const isSelected = mounted && currentLocale === opt.value
            const isItemLoading = isLangPending && pendingLangKey === opt.value

            return (
              <Button
                key={opt.key}
                variant="ghost"
                size="sm"
                disabled={isLangPending}
                onClick={() => handleLanguageChange(opt.value)}
                className={cn(
                  "flex h-8 w-full items-center justify-between text-xs font-normal",
                  !isSelected && "text-muted-foreground",
                  subItemClassName
                )}
              >
                <span>{opt.label}</span>
                <div className="flex items-center">
                  {isItemLoading ? (
                    <Loader2Icon className="size-3 animate-spin text-primary" />
                  ) : isSelected ? (
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
              {mounted && (
                <span className="text-[11px] font-medium capitalize">
                  {theme}
                </span>
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
                onClick={() => handleThemeChange(opt.value)}
                className={cn(
                  "flex h-8 w-full items-center justify-between text-xs font-normal",
                  !isSelected && "text-muted-foreground",
                  subItemClassName
                )}
              >
                <div className="flex items-center gap-2">
                  {OptIcon && (
                    <OptIcon className="size-3.5 text-muted-foreground" />
                  )}
                  <span>{opt.label}</span>
                </div>
                {isSelected ? (
                  <CheckIcon className="size-3.5 text-primary" />
                ) : (
                  <span className="size-3.5" aria-hidden="true" />
                )}
              </Button>
            )
          })}
        </CollapsibleContent>
      </Collapsible>

      {/* --- 3. قائمة العملة باستخدام خطاف useCurrency --- */}
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
              {mounted && (
                <span className="text-[11px] font-medium uppercase">
                  {currentCurrency}
                </span>
              )}
              <ChevronRight className="size-3.5 transition-transform duration-200 group-data-[state=open]/pref-curr:rotate-90 rtl:rotate-180" />
            </div>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-0.5 ps-6 pt-0.5">
          {currency.options.map((opt) => {
            const isSelected = mounted && currentCurrency === opt.value
            const isItemLoading =
              isCurrencyPending && targetCurrencyKey === opt.value

            return (
              <Button
                key={opt.key}
                variant="ghost"
                size="sm"
                disabled={isCurrencyPending}
                onClick={() => handleCurrencyChange(opt.value as CurrencyCode)}
                className={cn(
                  "flex h-8 w-full items-center justify-between text-xs font-normal",
                  !isSelected && "text-muted-foreground",
                  subItemClassName
                )}
              >
                <span>{opt.label}</span>
                <div className="flex items-center">
                  {isItemLoading ? (
                    <Loader2Icon className="size-3 animate-spin text-primary" />
                  ) : isSelected ? (
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
