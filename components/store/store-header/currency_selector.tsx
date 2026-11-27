"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { Check, ChevronDown, Loader2Icon } from "lucide-react"

import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
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
import {
  BottomSheet,
  BottomSheetBody,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetTrigger,
} from "@/components/shared/bottom-sheet"
import { PreferenceSegmented } from "./preference-segmented"

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

interface CurrencyListProps {
  activeCurrencyCode: string
  activeLoadingCode: string | null
  isMounted: boolean
  isPending: boolean
  optimisticLocale: string
  onSelectCurrency: (code: string) => void
}

function CurrencyList({
  activeCurrencyCode,
  activeLoadingCode,
  isMounted,
  isPending,
  optimisticLocale,
  onSelectCurrency,
}: CurrencyListProps) {
  return (
    <div className="space-y-1">
      {CURRENCIES.map((curr) => {
        const isSelected = isMounted && activeCurrencyCode === curr.code
        const isRowLoading = activeLoadingCode === curr.code
        const displayName =
          optimisticLocale === "ar" && curr.name_ar ? curr.name_ar : curr.name

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
                <bdi>{curr.symbol}</bdi>
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
  )
}

export function CurrencySelector({ compact = false }: CurrencySelectorProps) {
  const [open, setOpen] = React.useState(false)
  const [loadingCode, setLoadingCode] = React.useState<string | null>(null)

  const isMobile = useIsMobile()
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

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      setOpen(next && !isPending)
    },
    [isPending]
  )

  const currencyLabel = t(PREFERENCES_CONFIG.currency.name)

  const triggerButton = (
    <button
      type="button"
      aria-busy={isPending}
      className={selectorTriggerClass(compact, isPending)}
      aria-label={`${currencyLabel}: ${shownCurrency.code}`}
    >
      {isPending ? (
        <Loader2Icon
          aria-hidden="true"
          className="size-3 animate-spin text-primary"
        />
      ) : (
        /* على الجوال يكفي كود العملة، والرمز يظهر من sm */
        <bdi className="hidden text-primary sm:inline">
          {shownCurrency.symbol}
        </bdi>
      )}
      <span>{shownCurrency.code}</span>
      <ChevronDown
        aria-hidden="true"
        className={cn(
          "hidden size-3 text-muted-foreground transition-transform duration-200 sm:block",
          open && "rotate-180"
        )}
      />
    </button>
  )

  const listProps: CurrencyListProps = {
    activeCurrencyCode: activeCurrency.code,
    activeLoadingCode,
    isMounted,
    isPending,
    optimisticLocale,
    onSelectCurrency,
  }

  return (
    <>
      {/* الشاشات الأصغر من lg: BottomSheet على الجوال و Popover على الأجهزة اللوحية */}
      <div className="lg:hidden">
        {isMobile ? (
          <BottomSheet open={open} onOpenChange={handleOpenChange}>
            <BottomSheetTrigger asChild>{triggerButton}</BottomSheetTrigger>
            <BottomSheetContent ariaLabel={currencyLabel}>
              <BottomSheetHeader>
                <span className="text-sm font-normal text-foreground">
                  {currencyLabel}
                </span>
              </BottomSheetHeader>
              <BottomSheetBody className="px-2 py-2">
                <CurrencyList {...listProps} />
              </BottomSheetBody>
            </BottomSheetContent>
          </BottomSheet>
        ) : (
          <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
            <PopoverContent align="end" className="w-44 p-1.5 font-normal">
              <CurrencyList {...listProps} />
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* الشاشات الأكبر من lg: أزرار مجزأة */}
      <div className="hidden lg:inline-flex">
        <PreferenceSegmented
          ariaLabel={currencyLabel}
          value={shownCurrency.code}
          onSelect={onSelectCurrency}
          isPending={isPending}
          loadingValue={activeLoadingCode}
          options={CURRENCIES.map((curr) => ({
            value: curr.code,
            label: curr.code,
            icon: (
              <bdi aria-hidden="true" className="text-[11px] text-primary">
                {curr.symbol}
              </bdi>
            ),
          }))}
        />
      </div>
    </>
  )
}