"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { Check, ChevronDown, Globe, Loader2Icon } from "lucide-react"

import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { useLanguagePreference } from "@/lib/hooks/use-store-preferences"
import { PreferenceOption, PREFERENCES_CONFIG } from "./store-header-config"
import { menuItemClass, selectorTriggerClass } from "./store-header-shared"
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
import { PreferenceSegmented } from "./preference-segmented"

interface LocaleSelectorProps {
  compact?: boolean
}

interface LocaleListProps {
  options: readonly PreferenceOption[]
  optimisticLocale: string
  activeLoadingLocale: string | null
  isMobile: boolean
  isMounted: boolean
  isPending: boolean
  onSelectLanguage: (value: string) => void
}

function LocaleList({
  options,
  optimisticLocale,
  activeLoadingLocale,
  isMobile,
  isMounted,
  isPending,
  onSelectLanguage,
}: LocaleListProps) {
  return (
    <div className={cn(isMobile ? "space-y-1.5" : "space-y-1")}>
      {options.map((opt) => {
        const isSelected = isMounted && optimisticLocale === opt.value
        const isRowLoading = activeLoadingLocale === opt.value

        return (
          <button
            key={opt.key}
            type="button"
            disabled={isPending}
            aria-pressed={isSelected}
            onClick={() => onSelectLanguage(opt.value)}
            className={cn(
              menuItemClass(isSelected),
              isMobile && "min-h-11 rounded-xl px-3.5 py-2.5 text-sm"
            )}
          >
            <span lang={opt.value}>{opt.label}</span>
            {isRowLoading ? (
              <Loader2Icon
                aria-hidden="true"
                className={cn(
                  "shrink-0 animate-spin text-primary",
                  isMobile ? "size-4" : "size-3.5"
                )}
              />
            ) : (
              isSelected && (
                <Check
                  aria-hidden="true"
                  className={cn(
                    "shrink-0 text-primary",
                    isMobile ? "size-4" : "size-3.5"
                  )}
                />
              )
            )}
          </button>
        )
      })}
    </div>
  )
}

export function LocaleSelector({ compact = false }: LocaleSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const [loadingLocale, setLoadingLocale] = React.useState<string | null>(null)

  const isMobile = useIsMobile()
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

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      setOpen(next && !isPending)
    },
    [isPending]
  )

  const languageLabel = t(language.name)

  const triggerButton = (
    <button
      type="button"
      aria-busy={isPending}
      className={selectorTriggerClass(compact, isPending)}
      aria-label={`${languageLabel}: ${shownOption.label}`}
    >
      {isPending ? (
        <Loader2Icon
          aria-hidden="true"
          className="size-3 animate-spin text-primary"
        />
      ) : (
        <Globe aria-hidden="true" className="size-3.5 text-muted-foreground" />
      )}
      {/* على الجوال تكفي الأيقونة، مثل زر المظهر */}
      <span className="hidden sm:inline">{shownOption.label}</span>
      <ChevronDown
        aria-hidden="true"
        className={cn(
          "hidden size-3 text-muted-foreground transition-transform duration-200 sm:block",
          open && "rotate-180"
        )}
      />
    </button>
  )

  const listProps: LocaleListProps = {
    options: language.options,
    optimisticLocale,
    activeLoadingLocale,
    isMobile,
    isMounted,
    isPending,
    onSelectLanguage,
  }

  return (
    <>
      {/* الشاشات الأصغر من lg: BottomSheet على الجوال و Popover على الأجهزة اللوحية */}
      <div className="lg:hidden">
        {isMobile ? (
          <BottomSheet open={open} onOpenChange={handleOpenChange}>
            <BottomSheetTrigger asChild>{triggerButton}</BottomSheetTrigger>
            <BottomSheetContent ariaLabel={languageLabel}>
              <BottomSheetHeader>
                <span className="text-base font-normal text-foreground">
                  {languageLabel}
                </span>
              </BottomSheetHeader>
              <BottomSheetBody className="px-3 py-3">
                <LocaleList {...listProps} />
              </BottomSheetBody>
            </BottomSheetContent>
          </BottomSheet>
        ) : (
          <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
            <PopoverContent align="end" className="w-44 p-1.5 font-normal">
              <LocaleList {...listProps} />
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* الشاشات الأكبر من lg: أزرار مجزأة */}
      <div className="hidden lg:inline-flex">
        <PreferenceSegmented
          ariaLabel={languageLabel}
          value={shownOption.value}
          onSelect={onSelectLanguage}
          isPending={isPending}
          loadingValue={activeLoadingLocale}
          options={language.options.map((opt: PreferenceOption) => ({
            value: opt.value,
            label: opt.label,
            lang: opt.value,
            icon: (
              <Globe
                aria-hidden="true"
                className="size-3 text-muted-foreground"
              />
            ),
          }))}
        />
      </div>
    </>
  )
}