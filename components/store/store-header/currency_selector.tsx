"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { Check, ChevronDown, Loader2Icon } from "lucide-react"

import {
  useCurrencyPreference,
  useLanguagePreference,
} from "@/lib/hooks/use-store-preferences"
import { PREFERENCES_CONFIG, SUPPORTED_CURRENCIES } from "./store-header-config"
import { menuItemClass, selectorTriggerClass } from "./store-header-shared"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"

interface CurrencyItem {
  code: string
  name: string
  name_ar?: string
  symbol: string
}

interface CurrencySelectorProps {
  compact?: boolean
}

const CURRENCIES = Object.values(SUPPORTED_CURRENCIES) as CurrencyItem[]
const DEFAULT_CURRENCY = SUPPORTED_CURRENCIES.SYP as CurrencyItem

export function CurrencySelector({ compact = false }: CurrencySelectorProps) {
  const [open, setOpen] = React.useState(false)
  const t = useTranslations("Navigation.preferences")
  const { optimisticLocale } = useLanguagePreference()
  const { currentCurrency, isMounted, isPending, handleCurrencyChange } =
    useCurrencyPreference()

  const activeCurrency = currentCurrency as CurrencyItem
  // قبل التحميل نعرض العملة الافتراضية بالكامل (الرمز + الكود) لتفادي عدم تطابق الـ hydration
  const shownCurrency = isMounted ? activeCurrency : DEFAULT_CURRENCY

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={isPending}
          className={selectorTriggerClass(compact, isPending)}
          aria-label={t(PREFERENCES_CONFIG.currency.name)}
        >
          {isPending ? (
            <Loader2Icon
              aria-hidden="true"
              className="size-3 animate-spin text-primary"
            />
          ) : (
            <span className="text-primary">{shownCurrency.symbol}</span>
          )}
          <span>{shownCurrency.code}</span>
          <ChevronDown
            aria-hidden="true"
            className="size-3 text-muted-foreground"
          />
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-56 p-1.5 font-normal">
        <ScrollArea className="h-62 pe-1">
          <div className="space-y-1">
            {CURRENCIES.map((curr) => {
              const isSelected = isMounted && activeCurrency.code === curr.code
              const displayName =
                optimisticLocale === "ar" && curr.name_ar
                  ? curr.name_ar
                  : curr.name

              return (
                <button
                  key={curr.code}
                  type="button"
                  disabled={isPending}
                  aria-pressed={isSelected}
                  onClick={() => {
                    handleCurrencyChange(curr.code)
                    setOpen(false)
                  }}
                  className={menuItemClass(isSelected)}
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span className="w-8 shrink-0 text-start text-[11px] text-muted-foreground">
                      {curr.symbol}
                    </span>
                    <span className="truncate">{displayName}</span>
                  </span>
                  {isSelected && !isPending && (
                    <Check
                      aria-hidden="true"
                      className="size-3.5 shrink-0 text-primary"
                    />
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
