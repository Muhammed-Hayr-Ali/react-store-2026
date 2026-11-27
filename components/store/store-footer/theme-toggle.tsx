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
import {
  BottomSheet,
  BottomSheetBody,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetTrigger,
} from "@/components/shared/bottom-sheet"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

const THEME_OPTIONS = [
  { value: "light", labelKey: "LIGHT" },
  { value: "dark", labelKey: "DARK" },
  { value: "system", labelKey: "SYSTEM" },
] as const

interface ThemeOptionsListProps {
  theme: string | undefined
  onSelect: (value: string) => void
  t: ReturnType<typeof useTranslations>
}

function ThemeOptionsList({ theme, onSelect, t }: ThemeOptionsListProps) {
  return (
    <div className="flex flex-col gap-0.5">
      {THEME_OPTIONS.map(({ value, labelKey }) => {
        const isActive = theme === value
        return (
          <button
            key={value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelect(value)}
            className={cn(
              "flex w-full items-center justify-between gap-2 rounded-sm px-2.5 py-2 text-sm font-normal transition-colors hover:bg-accent hover:text-accent-foreground sm:py-1.5",
              isActive && "bg-accent/60 text-accent-foreground"
            )}
          >
            <span>{t(labelKey)}</span>
            {isActive && (
              <Check aria-hidden="true" className="size-3.5 shrink-0" />
            )}
          </button>
        )
      })}
    </div>
  )
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const isMobile = useIsMobile()
  const t = useTranslations("Footer")
  const [open, setOpen] = React.useState(false)

  const handleSelect = React.useCallback(
    (value: string) => {
      setTheme(value)
      setOpen(false)
    },
    [setTheme]
  )

  const triggerButton = (
    <Button variant="outline" size="icon">
      <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )

  return isMobile ? (
    <BottomSheet open={open} onOpenChange={setOpen}>
      <BottomSheetTrigger asChild>{triggerButton}</BottomSheetTrigger>
      <BottomSheetContent ariaLabel="Toggle theme">
        <BottomSheetHeader>
          <span className="text-sm font-normal text-foreground">
            {t("SYSTEM")}
          </span>
        </BottomSheetHeader>
        <BottomSheetBody className="px-2 py-2">
          <ThemeOptionsList theme={theme} onSelect={handleSelect} t={t} />
        </BottomSheetBody>
      </BottomSheetContent>
    </BottomSheet>
  ) : (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
      <PopoverContent align="end" className="w-36 p-1">
        <ThemeOptionsList theme={theme} onSelect={handleSelect} t={t} />
      </PopoverContent>
    </Popover>
  )
}
