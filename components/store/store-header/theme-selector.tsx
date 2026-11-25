"use client"

import { useThemePreference } from "@/lib/hooks/use-store-preferences"
import { useTranslations } from "next-intl"
import React from "react"
import { PreferenceOption, PREFERENCES_CONFIG } from "./store-header-config"

 import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Check, ChevronDown, Loader2Icon } from "lucide-react"
import { cn } from "cn"
 


interface ThemeSelectorProps {
  compact?: boolean
}


const getTriggerClass = (compact = false, disabled = false) =>
  cn(
    "flex items-center gap-1.5 rounded-lg bg-muted/60 px-2.5 text-[11px] font-normal text-foreground/85 transition-colors hover:bg-muted hover:text-foreground",
    compact ? "h-8" : "h-9",
    disabled && "pointer-events-none opacity-70"
  )

const getMenuItemClass = (isSelected = false) =>
  cn(
    "flex min-h-8 w-full items-center justify-between gap-2.5 rounded-md px-2.5 py-1.5 text-xs font-normal transition-colors hover:bg-muted",
    isSelected ? "bg-muted/70 text-primary" : "text-foreground/85"
  )


export function ThemeSelector({ compact = false }: ThemeSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const t = useTranslations("Navigation.preferences")
  const { theme, isMounted, isPending, handleThemeChange } =
    useThemePreference()

  const { appearance } = PREFERENCES_CONFIG
  const effectiveThemeKey = isMounted ? (theme ?? "system") : "system"
  const activeOption =
    appearance.options.find((opt) => opt.value === effectiveThemeKey) ??
    appearance.options[1] ??
    appearance.options[0]
  const ActiveIcon = activeOption?.icon

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={isPending}
          className={getTriggerClass(compact, isPending)}
          aria-label={t(appearance.name)}
        >
          {isPending ? (
            <Loader2Icon className="size-3 animate-spin text-primary" />
          ) : (
            ActiveIcon && (
              <ActiveIcon className="size-3.5 text-muted-foreground" />
            )
          )}
          <span>{t(activeOption?.key ?? "system")}</span>
          <ChevronDown className="size-3 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-40 p-1.5 font-normal">
        <div className="space-y-1">
          {appearance.options.map((opt: PreferenceOption) => {
            const isSelected = isMounted && theme === opt.value
            const OptIcon = opt.icon
            return (
              <button
                key={opt.key}
                type="button"
                disabled={isPending}
                onClick={() => {
                  handleThemeChange(opt.value)
                  setOpen(false)
                }}
                className={getMenuItemClass(isSelected)}
              >
                <span className="flex items-center gap-2.5">
                  {OptIcon && (
                    <OptIcon className="size-3.5 shrink-0 text-muted-foreground" />
                  )}
                  <span>{t(opt.key)}</span>
                </span>
                {isSelected && !isPending && (
                  <Check className="size-3.5 shrink-0 text-primary" />
                )}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
