"use client"

/**
 * @file components/shared/currency-switcher.tsx
 * @description Popover menu to switch store currency dynamically without affecting the page scrollbar.
 */

import * as React from "react"
import { useCurrency } from "@/lib/context/currency-context"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CheckIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function CurrencySwitcher() {
  const { currentCurrency, setCurrency, currencies } = useCurrency()
  const [open, setOpen] = React.useState(false)

  const handleSelectCurrency = (code: string) => {
    setCurrency(code)
    setOpen(false) // إغلاق الـ Popover فور اختيار العملة
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="secondary" size="default" >
          <span>{currentCurrency.code}</span>
          <span className="text-[10px] font-normal">
            ({currentCurrency.symbol})
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-30 p-0.5 text-xs">
        <div className="flex flex-col gap-0.5">
          {currencies.map((currency) => {
            const isSelected = currentCurrency.code === currency.code
            return (
              <button
                key={currency.code}
                type="button"
                onClick={() => handleSelectCurrency(currency.code)}
                className={cn(
                  "flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-xs transition-colors hover:bg-muted",
                  isSelected
                    ? "font-bold text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-1.5">
                  <span>{currency.code}</span>
                  <span className="text-[10px] opacity-80">
                    ({currency.symbol})
                  </span>
                </div>
                {isSelected && <CheckIcon className="size-3.5 text-primary" />}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
