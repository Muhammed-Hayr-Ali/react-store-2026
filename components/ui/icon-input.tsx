import * as React from "react"
import { cn } from "@/lib/utils"

// تحديث اسم الواجهة ليتناسب مع الاسم الجديد
export interface IconInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  prefixIcon?: React.ReactNode
  suffixIcon?: React.ReactNode
}

const IconInput = React.forwardRef<HTMLInputElement, IconInputProps>(
  ({ className, type, prefixIcon, suffixIcon, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <input
          type={type}
          data-slot="input"
          className={cn(
            // تنسيقات Shadcn الأساسية لحقل الإدخال
            "h-7 w-full min-w-0 rounded-md border border-input bg-input/20 px-2 py-0.5 text-sm transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-xs/relaxed file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 md:text-xs/relaxed dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",

            // استخدام الخصائص المنطقية (ps, pe) للتوافق التلقائي مع اللغتين العربية والإنجليزية (RTL/LTR)
            prefixIcon ? "ps-9" : "ps-3",
            suffixIcon ? "pe-9" : "pe-3",

            className
          )}
          ref={ref}
          {...props}
        />

        {/* حاوية الأيقونة اليمنى (أو اليسرى في اللغة الإنجليزية) */}
        {prefixIcon && (
          <div className="pointer-events-none absolute inset-y-0 inset-s-0 flex items-center justify-center ps-3 text-muted-foreground">
            {prefixIcon}
          </div>
        )}

        {/* حاوية الأيقونة اليسرى (أو اليمنى في اللغة الإنجليزية) */}
        {suffixIcon && (
          <div className="absolute inset-y-0 inset-e-0 flex items-center justify-center pe-3 text-muted-foreground">
            {suffixIcon}
          </div>
        )}
      </div>
    )
  }
)

IconInput.displayName = "IconInput"

export { IconInput }
