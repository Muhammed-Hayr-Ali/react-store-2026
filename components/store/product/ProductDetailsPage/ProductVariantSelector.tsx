"use client"

import * as React from "react"
import { CheckIcon } from "lucide-react"
import { getColorHex, ProductVariantItem } from "./utils"

interface ProductVariantSelectorProps {
  attributeOptions: Record<string, string[]>
  selectedAttributes: Record<string, string>
  availableVariants: ProductVariantItem[]
  selectedVariant: ProductVariantItem | null
  onAttributeSelect: (key: string, value: string) => void
  onDirectVariantSelect: (variant: ProductVariantItem) => void
}

export function ProductVariantSelector({
  attributeOptions,
  selectedAttributes,
  availableVariants,
  selectedVariant,
  onAttributeSelect,
  onDirectVariantSelect,
}: ProductVariantSelectorProps) {
  if (Object.keys(attributeOptions).length > 0) {
    return (
      <div className="space-y-5">
        {Object.entries(attributeOptions).map(([key, values]) => {
          const lowerKey = key.toLowerCase()
          const isColor = lowerKey.includes("color") || lowerKey.includes("لون")

          return (
            <div key={key} className="space-y-2.5">
              <div className="text-xs">
                <span className="font-semibold text-foreground capitalize">
                  {isColor ? "Color" : key}
                </span>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {values.map((value) => {
                  const isSelected = selectedAttributes[key] === value

                  if (isColor) {
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => onAttributeSelect(key, value)}
                        className={`group relative flex size-9 cursor-pointer items-center justify-center rounded-full border transition-all ${
                          isSelected
                            ? "border-primary"
                            : "border-border/60 hover:scale-105"
                        }`}
                        title={value}
                        aria-label={`Select color ${value}`}
                      >
                        <span
                          className="size-7 rounded-full shadow-inner"
                          style={{ backgroundColor: getColorHex(value) }}
                        />
                        {isSelected && (
                          <CheckIcon
                            className={`absolute size-3.5 ${
                              getColorHex(value).toLowerCase() === "#ffffff"
                                ? "text-black"
                                : "text-white"
                            }`}
                          />
                        )}
                      </button>
                    )
                  }

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => onAttributeSelect(key, value)}
                      className={`flex h-9 min-w-12 cursor-pointer items-center justify-center rounded-lg border px-3 text-xs font-medium transition-all ${
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground shadow-xs"
                          : "border-border bg-card text-foreground hover:bg-muted"
                      }`}
                    >
                      {value}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  if (availableVariants.length > 0) {
    return (
      <div className="space-y-2.5">
        <span className="text-xs font-semibold text-foreground">Options</span>
        <div className="flex flex-wrap gap-2">
          {availableVariants.map((v) => {
            const isCurrent = selectedVariant?.id === v.id
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => onDirectVariantSelect(v)}
                className={`rounded-lg border px-3.5 py-2 text-xs font-medium transition-all ${
                  isCurrent
                    ? "border-primary bg-primary text-primary-foreground shadow-xs"
                    : "border-border bg-card text-foreground hover:bg-muted"
                }`}
              >
                {v.name || v.sku}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return null
}
