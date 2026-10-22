"use client"

/**
 * @file components/store/product-details/details/product-variants.tsx
 * @description Apple-style minimalist variant/option selector with full localization support.
 */

import * as React from "react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

interface ProductVariantsProps {
  options: Array<{
    id: string
    name: string
    values: Array<{ id: string; name: string; isSelected: boolean; isDisabled?: boolean }>
  }>
  onSelectOption: (optionId: string, valueId: string) => void
}

export function ProductVariants({ options, onSelectOption }: ProductVariantsProps) {
  const t = useTranslations("ProductDetails")

  if (!options || options.length === 0) return null

  return (
    <div className="space-y-4 py-2">
      {options.map((option) => (
        <div key={option.id} className="space-y-2">
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {option.name}
          </label>
          <div className="flex flex-wrap gap-2">
            {option.values.map((val) => {
              const isSelected = val.isSelected
              return (
                <button
                  key={val.id}
                  type="button"
                  onClick={() => onSelectOption(option.id, val.id)}
                  disabled={val.isDisabled}
                  className={cn(
                    "rounded-xl px-4 py-2.5 text-xs font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isSelected
                      ? "bg-foreground text-background shadow-sm scale-[1.02]"
                      : "bg-muted/50 text-foreground hover:bg-muted border border-border/40",
                    val.isDisabled && "opacity-40 cursor-not-allowed"
                  )}
                >
                  {val.name}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}