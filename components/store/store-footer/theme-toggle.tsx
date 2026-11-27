"use client"

import * as React from "react"
import { Check, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

const THEME_OPTIONS = [
  { value: "light", labelKey: "LIGHT" },
  { value: "dark", labelKey: "DARK" },
  { value: "system", labelKey: "SYSTEM" },
] as const

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const isMobile = useIsMobile()
  const t = useTranslations("Footer")
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align={isMobile ? "center" : "end"}
        className="w-36 p-1"
      >
        <div className="flex flex-col gap-0.5">
          {THEME_OPTIONS.map(({ value, labelKey }) => {
            const isActive = theme === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setTheme(value)
                  setOpen(false)
                }}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-sm px-2.5 py-1.5 text-sm font-normal transition-colors hover:bg-accent hover:text-accent-foreground",
                  isActive && "bg-accent/60 text-accent-foreground",
                )}
              >
                <span>{t(labelKey)}</span>
                {isActive && (
                  <Check
                    aria-hidden="true"
                    className={cn("size-3.5 shrink-0", isMobile && "ms-0.5")}
                  />
                )}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}