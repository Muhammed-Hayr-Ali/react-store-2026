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
import { cn } from "@/lib/utils"

interface CurrencySwitcherProps {
  currentCurrency: CurrencyCode
}

export function CurrencySwitcher({ currentCurrency }: CurrencySwitcherProps) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [isPending, setIsPending] = React.useState(false)

  const activeCurrency =
    SUPPORTED_CURRENCIES.find((c) => c.code === currentCurrency) ||
    SUPPORTED_CURRENCIES[0]

  const handleCurrencyChange = async (newCurrency: string) => {
    if (newCurrency === currentCurrency) {
      setOpen(false)
      return
    }

    try {
      setIsPending(true)
      await setUserCurrency(newCurrency)
      setOpen(false)
      router.refresh()
    } finally {
      setIsPending(false)
    }
  }

  return (
    <CustomPopover open={open} onOpenChange={setOpen}>
      <CustomPopoverTrigger asChild>
        <button
          type="button"
          disabled={isPending}
          className={cn(
            "group inline-flex h-8 cursor-pointer items-center justify-between gap-1.5 rounded-lg border border-border/70 bg-background/60 px-2.5 text-xs font-medium text-foreground backdrop-blur-xs transition-all",
            "hover:border-border hover:bg-muted/50 focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-hidden",
            "disabled:pointer-events-none disabled:opacity-50",
            open && "border-border bg-muted/50"
          )}
          aria-label="Change currency"
        >
          {isPending ? (
            <Loader2Icon className="size-3.5 animate-spin text-muted-foreground" />
          ) : (
            <span className="font-semibold text-foreground tabular-nums">
              {activeCurrency.code}
            </span>
          )}

          <span className="text-[11px] text-muted-foreground">
            {activeCurrency.symbol || "$"}
          </span>

          <ChevronDownIcon
            className={cn(
              "size-3 text-muted-foreground/70 transition-transform duration-200 group-hover:text-foreground",
              open && "rotate-180 text-foreground"
            )}
          />
        </button>
      </CustomPopoverTrigger>

      <CustomPopoverContent
        align="end"
        className="w-48 overflow-hidden rounded-xl border border-border/80 bg-popover/95 p-0.5 backdrop-blur-md"
      >
        <div className="flex flex-col gap-0.5">
          {SUPPORTED_CURRENCIES.map((currency) => {
            const isSelected = currentCurrency === currency.code

            return (
              <button
                key={currency.code}
                type="button"
                onClick={() => handleCurrencyChange(currency.code)}
                className={cn(
                  "flex w-full cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors",
                  isSelected
                    ? "bg-primary/10 font-semibold text-primary"
                    : "text-foreground hover:bg-muted/70 hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="w-8 font-bold">{currency.code}</span>
                  <span className="text-[11px] text-muted-foreground">
                    {currency.symbol}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                 
                  {isSelected && (
                    <CheckIcon className="size-3.5 text-primary" />
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
