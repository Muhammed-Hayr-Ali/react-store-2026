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
      if (onSelect) onSelect()
      return
    }

    try {
      setIsPending(true)
      await setUserCurrency(currencyCode)
      if (onSelect) onSelect()
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
            "flex h-10 items-center justify-start font-normal aria-expanded:bg-transparent"
          )}
        >
          {isPending ? (
            <Loader2 className="mr-2 size-4 animate-spin rtl:mr-0 rtl:ml-2" />
          ) : (
            <Coins className="mr-2 size-4 rtl:mr-0 rtl:ml-2" />
          )}
          <span>Currency</span>
          {/* تم استبدال ms-auto بـ ms-2 لتكون بجوار الكلمة مباشرة */}
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
                  "flex items-center justify-start gap-2",
                  !isSelected && "font-normal text-muted-foreground"
                )}
              >
                {isSelected ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <div className="h-4 w-4" />
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
