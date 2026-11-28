"use client"

/**
 * @file components/store/product-details/details/product-variants.tsx
 * @description Apple-style minimalist variant selector with extreme simplicity and clean spacing.
 */

import { cn } from "@/lib/utils"

export interface VariantOption {
  id: string
  name: string
  values: Array<{
    id: string
    name: string
    isSelected: boolean
    isDisabled?: boolean
  }>
}

interface ProductVariantsProps {
  options: VariantOption[]
  onSelectOption: (optionId: string, valueId: string) => void
}

// أسماء CSS الشائعة فقط؛ أي قيمة أخرى (مثل "أحمر" أو "Midnight Blue") تعرض كنص
const NAMED_COLORS = new Set(
  "black white red green blue yellow orange purple pink brown gray grey silver gold beige navy teal maroon olive cyan magenta ivory khaki violet indigo turquoise coral crimson lavender".split(
    " "
  )
)

function isCssColor(value: string): boolean {
  const color = value.trim().toLowerCase()
  return (
    NAMED_COLORS.has(color) ||
    /^#([\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/.test(color) ||
    /^(rgb|hsl)a?\([\d\s.,%/]+\)$/.test(color)
  )
}

export function ProductVariants({
  options,
  onSelectOption,
}: ProductVariantsProps) {
  if (options.length === 0) return null

  return (
    <div className="space-y-5">
      {options.map((option) => {
        const key = option.id.toLowerCase()
        const isColor =
          key.includes("color") ||
          key.includes("colour") ||
          key.includes("لون")
        const selected = option.values.find((v) => v.isSelected)

        return (
          <fieldset key={option.id} className="min-w-0">
            <legend className="mb-2.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-2">
                <bdi className="font-medium tracking-wider uppercase">
                  {option.name}
                </bdi>
                {selected && (
                  <bdi className="font-semibold text-foreground">
                    {selected.name}
                  </bdi>
                )}
              </span>
            </legend>

            <div className="flex flex-wrap gap-2.5">
              {option.values.map((val) => {
                const isSwatch = isColor && isCssColor(val.name)

                return (
                  <button
                    key={val.id}
                    type="button"
                    onClick={() => onSelectOption(option.id, val.id)}
                    // الخيار المختار يبقى مفعّلاً حتى لو نفد
                    disabled={val.isDisabled && !val.isSelected}
                    aria-pressed={val.isSelected}
                    aria-label={val.name}
                    title={val.name}
                    className={cn(
                      "transition outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-35",
                      isSwatch
                        ? "size-9 rounded-full p-0.5 ring-offset-background"
                        : "h-10 min-w-12 rounded-full border px-4 text-sm",
                      isSwatch &&
                        (val.isSelected
                          ? "ring-2 ring-foreground ring-offset-2"
                          : "hover:scale-105"),
                      !isSwatch &&
                        (val.isSelected
                          ? "border-foreground bg-foreground font-medium text-background"
                          : "border-border bg-background text-foreground hover:border-foreground/50"),
                      !isSwatch && val.isDisabled && "line-through"
                    )}
                  >
                    {isSwatch ? (
                      <span
                        className="block size-full rounded-full border border-foreground/15"
                        style={{ backgroundColor: val.name }}
                      />
                    ) : (
                      val.name
                    )}
                  </button>
                )
              })}
            </div>
          </fieldset>
        )
      })}
    </div>
  )
}
