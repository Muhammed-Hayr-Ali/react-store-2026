"use client"

/**
 * @file components/store/product-details/details/product-variants.tsx
 * @description Apple-style minimalist variant selector with extreme simplicity and clean spacing.
 */

import { cn } from "@/lib/utils"

interface ProductVariantsProps {
  options: Array<{
    id: string
    name: string
    values: Array<{
      id: string
      name: string
      isSelected: boolean
      isDisabled?: boolean
    }>
  }>
  onSelectOption: (optionId: string, valueId: string) => void
}

export function ProductVariants({
  options,
  onSelectOption,
}: ProductVariantsProps) {
  if (!options || options.length === 0) return null

  return (
    <div className="space-y-6 py-2">
      {options.map((option) => {
        const optionKey = option.id.toLowerCase()
        const optionName = option.name.toLowerCase()

        const isColor =
          optionKey.includes("color") ||
          optionName.includes("color") ||
          optionName.includes("لون")

        return (
          <div key={option.id}>
            {/* عنوان الخاصية بتصميم خفيف ونظيف */}
            <label className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
              {option.name}
            </label>

            {/* الخيارات */}
            <div className="flex flex-wrap gap-2.5">
              {option.values.map((val) => {
                const isSelected = val.isSelected

                {
                  /* 1. عرض الألوان: دوائر نقية وبسيطة */
                }
                if (isColor) {
                  return (
                    <button
                      key={val.id}
                      type="button"
                      onClick={() => onSelectOption(option.id, val.id)}
                      disabled={val.isDisabled}
                      title={val.name}
                      className={cn(
                        "relative flex size-8 items-center justify-center rounded-full transition-transform duration-500 outline-none",
                        isSelected
                          ? "ring-1 ring-muted-foreground/50 ring-offset-2"
                          : "opacity-80 hover:scale-95 hover:opacity-100",
                        val.isDisabled && "cursor-not-allowed opacity-20"
                      )}
                    >
                      <span
                        className="size-full rounded-full border border-black/10"
                        style={{ backgroundColor: val.name }}
                      />
                    </button>
                  )
                }

                {
                  /* 2. عرض النصوص البسيطة (المقاسات، الأوزان، النكهات، المواد) بأقصى بساطة */
                }
                return (
                  <button
                    key={val.id}
                    type="button"
                    onClick={() => onSelectOption(option.id, val.id)}
                    disabled={val.isDisabled}
                    className={cn(
                      "h-8 rounded-sm px-3.5 text-xs  transition-transform duration-500  outline-none",
                      isSelected
                        ? "border border-transparent bg-foreground text-background shadow-sm"
                        : "border bg-muted/40 text-foreground hover:bg-muted/80",
                      val.isDisabled &&
                        "cursor-not-allowed line-through opacity-30"
                    )}
                  >
                    {val.name}
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
