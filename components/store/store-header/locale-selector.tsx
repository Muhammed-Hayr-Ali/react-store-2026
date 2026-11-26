"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { Check, ChevronDown, Globe, Loader2Icon } from "lucide-react"

import { useLanguagePreference } from "@/lib/hooks/use-store-preferences"
import { PreferenceOption, PREFERENCES_CONFIG } from "./store-header-config"
import { menuItemClass, selectorTriggerClass } from "./store-header-shared"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface LocaleSelectorProps {
  compact?: boolean
}

export function LocaleSelector({ compact = false }: LocaleSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const [loadingLocale, setLoadingLocale] = React.useState<string | null>(null)

  const t = useTranslations("Navigation.preferences")
  const { optimisticLocale, isMounted, isPending, handleLanguageChange } =
    useLanguagePreference()

  const { language } = PREFERENCES_CONFIG
  const defaultOption = language.options[0]
  const activeOption =
    language.options.find((opt) => opt.value === optimisticLocale) ??
    defaultOption
  const shownOption = isMounted ? activeOption : defaultOption
  const activeLoadingLocale = isPending ? loadingLocale : null

  const onSelectLanguage = React.useCallback(
    (nextValue: string) => {
      if (isPending || nextValue === optimisticLocale) {
        setLoadingLocale(null)
        return
      }
      setLoadingLocale(nextValue)
      handleLanguageChange(nextValue)
      setOpen(false)
    },
    [handleLanguageChange, isPending, optimisticLocale]
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
              aria-label={t(language.name)}
            >
              {isPending ? (
                <Loader2Icon
                  aria-hidden="true"
                  className="size-3 animate-spin text-primary"
                />
              ) : (
                <Globe
                  aria-hidden="true"
                  className="size-3.5 text-muted-foreground"
                />
              )}
              <span>{shownOption.label}</span>
              <ChevronDown
                aria-hidden="true"
                className="size-3 text-muted-foreground"
              />
            </button>
          </PopoverTrigger>

          <PopoverContent align="end" className="w-44 p-1.5 font-normal">
            <div className="space-y-1">
              {language.options.map((opt: PreferenceOption) => {
                const isSelected = isMounted && optimisticLocale === opt.value
                const isRowLoading = activeLoadingLocale === opt.value

                return (
                  <button
                    key={opt.key}
                    type="button"
                    disabled={isPending}
                    aria-pressed={isSelected}
                    onClick={() => onSelectLanguage(opt.value)}
                    className={menuItemClass(isSelected)}
                  >
                    <span>{opt.label}</span>
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
          value={shownOption.value}
          onValueChange={(value) => onSelectLanguage(value)}
        >
          <TabsList
            aria-label={t(language.name)}
            className="h-8 rounded-xl bg-muted/60 p-0.5"
          >
            {language.options.map((opt: PreferenceOption) => {
              const isRowLoading = activeLoadingLocale === opt.value

              return (
                <TabsTrigger
                  key={opt.key}
                  value={opt.value}
                  disabled={isPending}
                  className="h-7 gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-all data-[state=active]:bg-background data-[state=active]:shadow-xs"
                >
                  {isRowLoading ? (
                    <Loader2Icon
                      aria-hidden="true"
                      className="size-3 animate-spin text-primary"
                    />
                  ) : (
                    <Globe
                      aria-hidden="true"
                      className="size-3 text-muted-foreground"
                    />
                  )}
                  <span>{opt.label}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>
        </Tabs>
      </div>
    </>
  )
}