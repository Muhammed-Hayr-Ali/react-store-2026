"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { CheckIcon, ChevronDownIcon, Loader2Icon } from "lucide-react"

import { setUserCurrency } from "@/lib/actions/currency/mutations/set-currency"
import {
  CustomPopover,
  CustomPopoverContent,
  CustomPopoverTrigger,
} from "@/components/ui/custom-popover"
import {
  CurrencyCode,
  SUPPORTED_CURRENCIES,
} from "@/lib/actions/currency/types"
import { useCurrency } from "@/lib/context/currency-context"
import { cn } from "@/lib/utils"

interface CurrencySwitcherProps {
  className?: string
}

export function CurrencySwitcher({ className }: CurrencySwitcherProps) {
  const router = useRouter()
  const { currency: currentCurrency } = useCurrency()
  const [open, setOpen] = React.useState(false)
  const [isPending, startTransition] = React.useTransition()

  const activeCurrency =
    SUPPORTED_CURRENCIES.find((c) => c.code === currentCurrency) ||
    SUPPORTED_CURRENCIES[0]

  const handleCurrencyChange = (newCurrency: CurrencyCode) => {
    if (newCurrency === currentCurrency || isPending) {
      setOpen(false)
      return
    }

    startTransition(async () => {
      try {
        await setUserCurrency(newCurrency)
        setOpen(false)
        router.refresh()
      } catch (error) {
        console.error("Failed to update currency:", error)
      }
    })
  }

  return (
    <CustomPopover open={open} onOpenChange={setOpen}>
      <CustomPopoverTrigger asChild>
        <button
          type="button"
          disabled={isPending}
          className={cn(
            "flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none",
            open && "bg-muted text-foreground",
            className
          )}
          aria-label="Change currency"
        >
          {isPending ? (
            <Loader2Icon className="size-3.5 animate-spin" />
          ) : (
            <span className="font-semibold text-foreground">
              {activeCurrency.code}
            </span>
          )}

          <ChevronDownIcon
            className={cn(
              "size-3 transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </button>
      </CustomPopoverTrigger>

      <CustomPopoverContent
        align="end"
        className="w-30 rounded-lg border-none bg-popover p-0.5 shadow-none"
      >
        <div className="flex flex-col gap-0.5">
          {SUPPORTED_CURRENCIES.map((currency) => {
            const isSelected = currentCurrency === currency.code

            return (
              <button
                key={currency.code}
                type="button"
                onClick={() =>
                  handleCurrencyChange(currency.code as CurrencyCode)
                }
                className={cn(
                  "flex w-full cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-xs transition-colors",
                  isSelected
                    ? "bg-accent font-semibold text-accent-foreground"
                    : "text-foreground hover:bg-muted"
                )}
              >
                <span>{currency.code}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-muted-foreground">
                    {currency.symbol}
                  </span>
                  {isSelected ? (
                    <CheckIcon className="size-3 text-primary" />
                  ) : (
                    <div className="size-3" />
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </CustomPopoverContent>
    </CustomPopover>
  )
}
