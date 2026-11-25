"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { Check, ChevronDown, Loader2Icon } from "lucide-react"

import { useThemePreference } from "@/lib/hooks/use-store-preferences"
import { PreferenceOption, PREFERENCES_CONFIG } from "./store-header-config"
import { menuItemClass, selectorTriggerClass } from "./store-header-shared"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface ThemeSelectorProps {
  compact?: boolean
}

export function ThemeSelector({ compact = false }: ThemeSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const t = useTranslations("Navigation.preferences")
  const { theme, isMounted, isPending, handleThemeChange } =
    useThemePreference()

  const { appearance } = PREFERENCES_CONFIG
  const effectiveThemeKey = isMounted ? (theme ?? "system") : "system"
  const activeOption =
    appearance.options.find((opt) => opt.value === effectiveThemeKey) ??
    appearance.options[appearance.options.length - 1]
  const ActiveIcon = activeOption?.icon

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={isPending}
          className={selectorTriggerClass(compact, isPending)}
          aria-label={t(appearance.name)}
        >
          {isPending ? (
            <Loader2Icon
              aria-hidden="true"
              className="size-3 animate-spin text-primary"
            />
          ) : (
            ActiveIcon && (
              <ActiveIcon
                aria-hidden="true"
                className="size-3.5 text-muted-foreground"
              />
            )
          )}
          <span>{t(activeOption?.key ?? "system")}</span>
          <ChevronDown
            aria-hidden="true"
            className="size-3 text-muted-foreground"
          />
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-40 p-1.5 font-normal">
        <div className="space-y-1">
          {appearance.options.map((opt: PreferenceOption) => {
            // نقارن مع effectiveThemeKey (وليس theme) ليتطابق التحديد مع ما يعرضه الزر
            const isSelected = isMounted && effectiveThemeKey === opt.value
            const OptIcon = opt.icon
            return (
              <button
                key={opt.key}
                type="button"
                disabled={isPending}
                aria-pressed={isSelected}
                onClick={() => {
                  handleThemeChange(opt.value)
                  setOpen(false)
                }}
                className={menuItemClass(isSelected)}
              >
                <span className="flex items-center gap-2.5">
                  {OptIcon && (
                    <OptIcon
                      aria-hidden="true"
                      className="size-3.5 shrink-0 text-muted-foreground"
                    />
                  )}
                  <span>{t(opt.key)}</span>
                </span>
                {isSelected && !isPending && (
                  <Check
                    aria-hidden="true"
                    className="size-3.5 shrink-0 text-primary"
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
