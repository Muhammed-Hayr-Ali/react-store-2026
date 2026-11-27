"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { Check, ChevronDown, Loader2Icon } from "lucide-react"

import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { useThemePreference } from "@/lib/hooks/use-store-preferences"
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

interface ThemeSelectorProps {
  compact?: boolean
}

interface ThemeListProps {
  options: readonly PreferenceOption[]
  effectiveThemeKey: string
  activeLoadingTheme: string | null
  isMounted: boolean
  isPending: boolean
  onSelectTheme: (value: string) => void
  t: ReturnType<typeof useTranslations>
}

function ThemeList({
  options,
  effectiveThemeKey,
  activeLoadingTheme,
  isMounted,
  isPending,
  onSelectTheme,
  t,
}: ThemeListProps) {
  return (
    <div className="space-y-1">
      {options.map((opt) => {
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
  )
}

export function ThemeSelector({ compact = false }: ThemeSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const [loadingTheme, setLoadingTheme] = React.useState<string | null>(null)

  const isMobile = useIsMobile()
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

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      setOpen(next && !isPending)
    },
    [isPending]
  )

  const appearanceLabel = t(appearance.name)

  const triggerButton = (
    <button
      type="button"
      aria-busy={isPending}
      className={selectorTriggerClass(compact, isPending)}
      aria-label={`${appearanceLabel}: ${t(activeOption?.key ?? "system")}`}
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
      {/* على الشاشات الضيقة تكفي الأيقونة حتى لا يفيض الصف */}
      <span className="hidden sm:inline">
        {t(activeOption?.key ?? "system")}
      </span>
      <ChevronDown
        aria-hidden="true"
        className={cn(
          "hidden size-3 text-muted-foreground transition-transform duration-200 sm:block",
          open && "rotate-180"
        )}
      />
    </button>
  )

  const listProps: ThemeListProps = {
    options: appearance.options,
    effectiveThemeKey,
    activeLoadingTheme,
    isMounted,
    isPending,
    onSelectTheme,
    t,
  }

  return (
    <>
      {/* الشاشات الأصغر من lg: BottomSheet على الجوال و Popover على الأجهزة اللوحية */}
      <div className="lg:hidden">
        {isMobile ? (
          <BottomSheet open={open} onOpenChange={handleOpenChange}>
            <BottomSheetTrigger asChild>{triggerButton}</BottomSheetTrigger>
            <BottomSheetContent ariaLabel={appearanceLabel}>
              <BottomSheetHeader>
                <span className="text-sm font-normal text-foreground">
                  {appearanceLabel}
                </span>
              </BottomSheetHeader>
              <BottomSheetBody className="px-2 py-2">
                <ThemeList {...listProps} />
              </BottomSheetBody>
            </BottomSheetContent>
          </BottomSheet>
        ) : (
          <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
            <PopoverContent align="end" className="w-40 p-1.5 font-normal">
              <ThemeList {...listProps} />
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* الشاشات الأكبر من lg: أزرار مجزأة */}
      <div className="hidden lg:inline-flex">
        <PreferenceSegmented
          ariaLabel={appearanceLabel}
          value={effectiveThemeKey}
          onSelect={onSelectTheme}
          isPending={isPending}
          loadingValue={activeLoadingTheme}
          collapseLabels
          options={appearance.options.map((opt: PreferenceOption) => {
            const OptIcon = opt.icon
            return {
              value: opt.value,
              label: t(opt.key),
              icon: OptIcon && (
                <OptIcon
                  aria-hidden="true"
                  className="size-3.5 text-muted-foreground"
                />
              ),
            }
          })}
        />
      </div>
    </>
  )
}