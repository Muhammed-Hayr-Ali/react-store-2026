import * as React from "react"

import { cn } from "@/lib/utils"

interface CustomInputProps {
  prefixIcon?: React.ReactNode
  suffixIcon?: React.ReactNode
}

function CustomInput({
  className,
  type,
  prefixIcon,
  suffixIcon,
  ...props
}: React.ComponentProps<"input"> & CustomInputProps) {
  return (
    <div className="relative w-full">
      <input
        type={type}
        data-slot="input"
        className={cn(
          "h-9 w-full min-w-0 rounded-md border border-input bg-input/20 px-2 py-0.5 text-sm transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-xs/relaxed file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 md:text-xs/relaxed dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
          `${prefixIcon ? "pl-7.5 rtl:pr-7.5" : "pl-2 rtl:pr-2"}`,
          `${suffixIcon ? "pr-7.5 rtl:pl-9" : "pr-2 rtl:pl-2"}`,
          className
        )}
        {...props}
      />
      {prefixIcon && (
        <div className="absolute top-1/2 left-2 z-40 flex -translate-y-1/2 items-center text-muted-foreground rtl:right-2 rtl:left-auto">
          {prefixIcon}
        </div>
      )}

      {suffixIcon && (
        <div className="absolute top-1/2 right-1 z-10 flex -translate-y-1/2 items-center rtl:right-auto rtl:left-1">
          {suffixIcon}
        </div>
      )}
    </div>
  )
}

export { CustomInput }
