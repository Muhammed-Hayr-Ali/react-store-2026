/**
 * @file components/shared/currency-switcher.tsx
 * @description Dropdown menu to switch store currency dynamically.
 */

"use client"

import * as React from "react"
import { useCurrency } from "@/lib/context/currency-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ChevronDownIcon, CoinsIcon } from "lucide-react"

export function CurrencySwitcher() {
  const { currentCurrency, setCurrency, currencies } = useCurrency()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 px-2.5 text-xs font-medium">
          <CoinsIcon className="size-3.5 text-muted-foreground" />
          <span>{currentCurrency.code}</span>
          <span className="text-muted-foreground">({currentCurrency.symbol})</span>
          <ChevronDownIcon className="size-3 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36 text-xs">
        {currencies.map((currency) => (
          <DropdownMenuItem
            key={currency.code}
            onClick={() => setCurrency(currency.code)}
            className={`flex cursor-pointer items-center justify-between ${
              currentCurrency.code === currency.code ? "font-bold text-primary" : ""
            }`}
          >
            <span>{currency.code}</span>
            <span className="text-muted-foreground">{currency.symbol}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}