"use client"

import {
  useCurrencyPreference,
  useLanguagePreference,
} from "@/lib/hooks/use-store-preferences"
import { useTranslations } from "next-intl"
import React from "react"
import { PREFERENCES_CONFIG, SUPPORTED_CURRENCIES } from "./store-header-config"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Check, ChevronDown, Loader2Icon } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "cn"

interface CurrencyItem {
  code: string
  name: string
  name_ar?: string
  symbol: string
}

interface CurrencySelectorProps {
  compact?: boolean
}

const getTriggerClass = (compact = false, disabled = false) =>
  cn(
    "flex items-center gap-1.5 rounded-lg bg-muted/60 px-2.5 text-[11px] font-normal text-foreground/85 transition-colors hover:bg-muted hover:text-foreground",
    compact ? "h-8" : "h-9",
    disabled && "pointer-events-none opacity-70"
  )

const getMenuItemClass = (isSelected = false) =>
  cn(
    "flex min-h-8 w-full items-center justify-between gap-2.5 rounded-md px-2.5 py-1.5 text-xs font-normal transition-colors hover:bg-muted",
    isSelected ? "bg-muted/70 text-primary" : "text-foreground/85"
  )

export function CurrencySelector({ compact = false }: CurrencySelectorProps) {
  const [open, setOpen] = React.useState(false)
  const t = useTranslations("Navigation.preferences")
  const { optimisticLocale } = useLanguagePreference()
  const { currentCurrency, isMounted, isPending, handleCurrencyChange } =
    useCurrencyPreference()

  const activeCurrency = currentCurrency as CurrencyItem
  const currencies = Object.values(SUPPORTED_CURRENCIES) as CurrencyItem[]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={isPending}
          className={getTriggerClass(compact, isPending)}
          aria-label={t(PREFERENCES_CONFIG.currency.name)}
        >
          {isPending ? (
            <Loader2Icon className="size-3 animate-spin text-primary" />
          ) : (
            <span className="text-primary">{activeCurrency.symbol}</span>
          )}
          <span>{isMounted ? activeCurrency.code : "SYP"}</span>
          <ChevronDown className="size-3 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-1.5 font-normal">
        <ScrollArea className="h-62 pe-1">
          <div className="space-y-1">
            {currencies.map((curr) => {
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
                  {isSelected && !isPending && (
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
