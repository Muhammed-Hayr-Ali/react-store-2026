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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
  const [loadingCode, setLoadingCode] = React.useState<string | null>(null)

  const t = useTranslations("Navigation.preferences")
  const { optimisticLocale } = useLanguagePreference()
  const { currentCurrency, isMounted, isPending, handleCurrencyChange } =
    useCurrencyPreference()

  const activeCurrency = currentCurrency as CurrencyItem
  const shownCurrency = isMounted ? activeCurrency : DEFAULT_CURRENCY

  // قيمة مشتقة مباشرة دون الحاجة لـ useEffect
  const activeLoadingCode = isPending ? loadingCode : null

  const onSelectCurrency = React.useCallback(
    (nextCode: string) => {
      if (isPending || nextCode === activeCurrency.code) {
        setLoadingCode(null)
        return
      }
      setLoadingCode(nextCode)
      handleCurrencyChange(nextCode)
      setOpen(false)
    },
    [activeCurrency.code, handleCurrencyChange, isPending]
  )

  return (
    <>
      {/* الشاشات الأصغر من lg: Popover */}
      <div className="lg:hidden">
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

          <PopoverContent align="end" className="w-44 p-1.5 font-normal">
            <div className="space-y-1">
              {CURRENCIES.map((curr) => {
                const isSelected =
                  isMounted && activeCurrency.code === curr.code
                const isRowLoading = activeLoadingCode === curr.code
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
                    onClick={() => onSelectCurrency(curr.code)}
                    className={menuItemClass(isSelected)}
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <span className="w-8 shrink-0 text-start text-[11px] text-muted-foreground">
                        {curr.symbol}
                      </span>
                      <span className="truncate">{displayName}</span>
                    </span>
                    {isRowLoading ? (
                      <Loader2Icon
                        aria-hidden="true"
                        className="size-3.5 shrink-0 animate-spin text-primary"
                      />
                    ) : (
                      isSelected && (
                        <Check
                          aria-hidden="true"
                          className="size-3.5 shrink-0 text-primary"
                        />
                      )
                    )}
                  </button>
                )
              })}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* الشاشات الأكبر من lg: Tabs */}
      <div className="hidden lg:inline-flex">
        <Tabs
          value={shownCurrency.code}
          onValueChange={(value) => onSelectCurrency(value)}
        >
          <TabsList
            aria-label={t(PREFERENCES_CONFIG.currency.name)}
            className="h-8 rounded-xl bg-muted/60 p-0.5"
          >
            {CURRENCIES.map((curr) => {
              const isRowLoading = activeLoadingCode === curr.code

              return (
                <TabsTrigger
                  key={curr.code}
                  value={curr.code}
                  disabled={isPending}
                  className="h-7 gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-all data-[state=active]:bg-background data-[state=active]:shadow-xs"
                >
                  {isRowLoading ? (
                    <Loader2Icon
                      aria-hidden="true"
                      className="size-3 animate-spin text-primary"
                    />
                  ) : (
                    <span className="text-[11px] text-primary">
                      {curr.symbol}
                    </span>
                  )}
                  <span>{curr.code}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>
        </Tabs>
      </div>
    </>
  )
}