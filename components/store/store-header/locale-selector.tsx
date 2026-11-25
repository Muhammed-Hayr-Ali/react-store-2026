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

interface LocaleSelectorProps {
  compact?: boolean
}

export function LocaleSelector({ compact = false }: LocaleSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const t = useTranslations("Navigation.preferences")
  const { optimisticLocale, isMounted, isPending, handleLanguageChange } =
    useLanguagePreference()

  const { language } = PREFERENCES_CONFIG
  const defaultOption = language.options[0]
  const activeOption =
    language.options.find((opt) => opt.value === optimisticLocale) ??
    defaultOption

  return (
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
          {/* بدل النص العربي الثابت: نستخدم أول لغة في الإعدادات قبل التحميل */}
          <span>{(isMounted ? activeOption : defaultOption).label}</span>
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
            return (
              <button
                key={opt.key}
                type="button"
                disabled={isPending}
                aria-pressed={isSelected}
                onClick={() => {
                  handleLanguageChange(opt.value)
                  setOpen(false)
                }}
                className={menuItemClass(isSelected)}
              >
                <span>{opt.label}</span>
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
