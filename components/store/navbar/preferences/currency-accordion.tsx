"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Check, Coins, Loader2 } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  CustomAccordion,
  CustomAccordionContent,
  CustomAccordionItem,
  CustomAccordionTrigger,
} from "@/components/ui/custom-accordion"
import {
  CurrencyCode,
  SUPPORTED_CURRENCIES,
} from "@/lib/actions/currency/types"
import { setUserCurrency } from "@/lib/actions/currency/mutations/set-currency"
import { cn } from "@/lib/utils"

interface CurrencyAccordionProps {
  currentCurrency: CurrencyCode
  onSelect?: () => void
}

export function CurrencyAccordion({
  currentCurrency,
  onSelect,
}: CurrencyAccordionProps) {
  const router = useRouter()
  const [isPending, setIsPending] = React.useState(false)

  const handleCurrencyChange = async (currencyCode: CurrencyCode) => {
    if (currencyCode === currentCurrency) {
      onSelect?.()
      return
    }

    try {
      setIsPending(true)
      await setUserCurrency(currencyCode)
      onSelect?.()
      router.refresh()
    } catch (error) {
      console.error("Error setting currency:", error)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <CustomAccordion type="single" collapsible>
      <CustomAccordionItem value="currency-item">
        <CustomAccordionTrigger
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "flex h-10 w-full items-center justify-start font-normal aria-expanded:bg-transparent"
          )}
        >
          {isPending ? (
            <Loader2 className="me-2 size-4 animate-spin" />
          ) : (
            <Coins className="me-2 size-4" />
          )}
          <span>Currency</span>
          <span className="ms-2 text-xs font-semibold text-muted-foreground uppercase">
            ({currentCurrency})
          </span>
        </CustomAccordionTrigger>

        <CustomAccordionContent className="flex flex-col px-2">
          {SUPPORTED_CURRENCIES.map((currency) => {
            const isSelected = currency.code === currentCurrency

            return (
              <Button
                key={currency.code}
                variant="ghost"
                disabled={isPending}
                onClick={() => handleCurrencyChange(currency.code)}
                className={cn(
                  "flex items-center justify-start gap-2 text-xs",
                  !isSelected && "font-normal text-muted-foreground"
                )}
              >
                {isSelected ? (
                  <Check className="size-3.5 text-primary" />
                ) : (
                  <span className="size-3.5" aria-hidden="true" />
                )}
                <span className="font-bold">{currency.code}</span>
                <span className="text-xs text-muted-foreground">
                  ({currency.symbol})
                </span>
              </Button>
            )
          })}
        </CustomAccordionContent>
      </CustomAccordionItem>
    </CustomAccordion>
  )
}
