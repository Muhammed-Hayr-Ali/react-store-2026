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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ThemeSelectorProps {
  compact?: boolean
}

export function ThemeSelector({ compact = false }: ThemeSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const [loadingTheme, setLoadingTheme] = React.useState<string | null>(null)

  const t = useTranslations("Navigation.preferences")
  const { theme, isMounted, isPending, handleThemeChange } =
    useThemePreference()

  const { appearance } = PREFERENCES_CONFIG
  const effectiveThemeKey = isMounted ? (theme ?? "system") : "system"
  const activeOption =
    appearance.options.find((opt) => opt.value === effectiveThemeKey) ??
    appearance.options[appearance.options.length - 1]
  const ActiveIcon = activeOption?.icon
  const activeLoadingTheme = isPending ? loadingTheme : null

  const onSelectTheme = React.useCallback(
    (nextValue: string) => {
      if (isPending || nextValue === effectiveThemeKey) {
        setLoadingTheme(null)
        return
      }
      setLoadingTheme(nextValue)
      handleThemeChange(nextValue)
      setOpen(false)
    },
    [effectiveThemeKey, handleThemeChange, isPending]
  )

  return (
    <>
      {/* الشاشات الأصغر من lg: Popover */}
      <div className="lg:hidden">
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
                const isSelected = isMounted && effectiveThemeKey === opt.value
                const isRowLoading = activeLoadingTheme === opt.value
                const OptIcon = opt.icon

                return (
                  <button
                    key={opt.key}
                    type="button"
                    disabled={isPending}
                    aria-pressed={isSelected}
                    onClick={() => onSelectTheme(opt.value)}
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
                    {isRowLoading ? (
                      <Loader2Icon
                        aria-hidden="true"
                        className="size-3.5 shrink-0 animate-spin text-primary"
                      />
                    ) : (
                      isSelected && (
                        <Check
                          aria-hidden="true"
                          className="size-3.5 shrink-0 text-primary"
                        />
                      )
                    )}
                  </button>
                )
              })}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* الشاشات الأكبر من lg: Tabs */}
      <div className="hidden lg:inline-flex">
        <Tabs
          value={effectiveThemeKey}
          onValueChange={(value) => onSelectTheme(value)}
        >
          <TabsList
            aria-label={t(appearance.name)}
            className="h-8 rounded-xl bg-muted/60 p-0.5"
          >
            {appearance.options.map((opt: PreferenceOption) => {
              const isRowLoading = activeLoadingTheme === opt.value
              const OptIcon = opt.icon

              return (
                <TabsTrigger
                  key={opt.key}
                  value={opt.value}
                  disabled={isPending}
                  title={t(opt.key)}
                  aria-label={t(opt.key)}
                  className="h-7 gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-all data-[state=active]:bg-background data-[state=active]:shadow-xs"
                >
                  {isRowLoading ? (
                    <Loader2Icon
                      aria-hidden="true"
                      className="size-3 animate-spin text-primary"
                    />
                  ) : (
                    OptIcon && (
                      <OptIcon
                        aria-hidden="true"
                        className="size-3.5 text-muted-foreground"
                      />
                    )
                  )}
                  <span className="hidden xl:inline">{t(opt.key)}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>
        </Tabs>
      </div>
    </>
  )
}