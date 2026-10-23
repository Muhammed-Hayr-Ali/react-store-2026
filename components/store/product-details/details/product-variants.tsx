"use client"

/**
 * @file components/store/product-details/details/product-variants.tsx
 * @description Apple-style minimalist variant/option selector with custom UI rendering per attribute type (color swatches, sizes, weights, materials, flavors).
 */


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

  
  if (!options || options.length === 0) return null

  return (
    <div className="space-y-6 py-2">
      {options.map((option) => {
        // توحيد اسم الخاصية لفحص نوعها بغض النظر عن حالة الأحرف
        const optionKey = option.id.toLowerCase()
        const optionName = option.name.toLowerCase()

        // تحديد نوع الخاصية بناءً على المعرف أو الاسم
        const isColor = optionKey.includes("color") || optionName.includes("color") || optionName.includes("لون")
        const isSize = optionKey.includes("size") || optionName.includes("size") || optionName.includes("مقاس")
        const isWeight = optionKey.includes("weight") || optionName.includes("weight") || optionName.includes("وزن")
        const isFlavor = optionKey.includes("flavor") || optionName.includes("flavor") || optionName.includes("نكهة")
        const isMaterial = optionKey.includes("material") || optionName.includes("material") || optionName.includes("مادة")

        return (
          <div key={option.id} className="space-y-2.5">
            {/* عنوان الخاصية */}
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {option.name}
              </label>
            </div>

            {/* طريقة العرض المخصصة لكل نوع */}
            <div className="flex flex-wrap gap-2.5">
              {option.values.map((val) => {
                const isSelected = val.isSelected

                // =================================================================
                // 1. طريقة عرض الألوان (Color Swatches)
                // =================================================================
                if (isColor) {
                  return (
                    <button
                      key={val.id}
                      type="button"
                      onClick={() => onSelectOption(option.id, val.id)}
                      disabled={val.isDisabled}
                      title={val.name}
                      className={cn(
                        "relative size-9 rounded-full p-0.5 flex items-center justify-center transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        isSelected
                          ? "ring-2 ring-foreground ring-offset-2 scale-105"
                          : "border border-border/60 hover:scale-95 opacity-80 hover:opacity-100",
                        val.isDisabled && "opacity-30 cursor-not-allowed"
                      )}
                    >
                      <span
                        className="size-full rounded-full border border-black/10 shadow-inner"
                        style={{ backgroundColor: val.name }}
                      />
                    </button>
                  )
                }

                // =================================================================
                // 2. طريقة عرض المقاسات (Size Badges)
                // =================================================================
                if (isSize) {
                  return (
                    <button
                      key={val.id}
                      type="button"
                      onClick={() => onSelectOption(option.id, val.id)}
                      disabled={val.isDisabled}
                      className={cn(
                        "min-w-11 h-10 px-3.5 rounded-lg text-xs font-bold tracking-wide transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring flex items-center justify-center uppercase",
                        isSelected
                          ? "bg-foreground text-background shadow-sm scale-105"
                          : "bg-muted/40 text-foreground hover:bg-muted border border-border/60",
                        val.isDisabled && "opacity-40 cursor-not-allowed line-through"
                      )}
                    >
                      {val.name}
                    </button>
                  )
                }

                // =================================================================
                // 3. طريقة عرض المواد (Materials) - تصميم خاص مميز للمواد
                // =================================================================
                if (isMaterial) {
                  return (
                    <button
                      key={val.id}
                      type="button"
                      onClick={() => onSelectOption(option.id, val.id)}
                      disabled={val.isDisabled}
                      className={cn(
                        "rounded-lg px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        isSelected
                          ? "bg-foreground text-background shadow-sm scale-[1.02]"
                          : "bg-muted/30 text-foreground hover:bg-muted border border-dashed border-border",
                        val.isDisabled && "opacity-40 cursor-not-allowed"
                      )}
                    >
                      {val.name}
                    </button>
                  )
                }

                // =================================================================
                // 4. طريقة عرض الأوزان (Weights) أو النكهات (Flavors) والبقية
                // =================================================================
                return (
                  <button
                    key={val.id}
                    type="button"
                    onClick={() => onSelectOption(option.id, val.id)}
                    disabled={val.isDisabled}
                    className={cn(
                      "rounded-lg px-4 py-2 text-xs font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isFlavor && "capitalize",
                      isSelected
                        ? "bg-foreground text-background shadow-sm scale-[1.02]"
                        : "bg-muted/40 text-foreground hover:bg-muted border border-border/40",
                      val.isDisabled && "opacity-40 cursor-not-allowed"
                    )}
                  >
                    {val.name}
                    {isWeight && <span className="ms-1 text-[10px] opacity-70"></span>}
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