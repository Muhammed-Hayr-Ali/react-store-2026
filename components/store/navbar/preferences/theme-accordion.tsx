"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { CheckIcon } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  CustomAccordion,
  CustomAccordionContent,
  CustomAccordionItem,
  CustomAccordionTrigger,
} from "@/components/ui/custom-accordion"
import { storeNavConfig } from "../nav-config"
import { cn } from "@/lib/utils"

interface ThemeAccordionProps {
  onSelect?: () => void
}

export function ThemeAccordion({ onSelect }: ThemeAccordionProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  const config = storeNavConfig.preferences.appearance

  React.useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMounted(true)
    })
    return () => cancelAnimationFrame(frame)
  }, [])

  const currentThemeLabel =
    config.options.find((opt) => opt.value === theme)?.key || theme

  const handleSelectTheme = (newTheme: string) => {
    setTheme(newTheme)
    onSelect?.()
  }

  if (!mounted) {
    return (
      <CustomAccordion type="single" collapsible>
        <CustomAccordionItem value="item-theme">
          <CustomAccordionTrigger
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "flex h-10 w-full items-center justify-between font-normal aria-expanded:bg-transparent"
            )}
          >
            <div className="flex items-center gap-2">
              <config.icon className="size-4 text-muted-foreground" />
              <span>{config.name}</span>
            </div>
          </CustomAccordionTrigger>
          <CustomAccordionContent className="flex flex-col gap-0.5 px-1 pt-1">
            {config.options.map((item) => (
              <Button
                key={item.key}
                variant="ghost"
                disabled
                className="flex h-9 w-full items-center justify-start gap-2 rounded-lg text-xs font-normal"
              >
                <span className="size-3.5" aria-hidden="true" />
                <span>{item.label}</span>
              </Button>
            ))}
          </CustomAccordionContent>
        </CustomAccordionItem>
      </CustomAccordion>
    )
  }

  return (
    <CustomAccordion type="single" collapsible>
      <CustomAccordionItem value="item-theme">
        <CustomAccordionTrigger
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "flex h-10 w-full items-center justify-between font-normal aria-expanded:bg-transparent"
          )}
        >
          <div className="flex items-center gap-2">
            <config.icon className="size-4 text-muted-foreground" />
            <span>{config.name}</span>
          </div>
          {currentThemeLabel && (
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              ({currentThemeLabel})
            </span>
          )}
        </CustomAccordionTrigger>

        <CustomAccordionContent className="flex flex-col gap-0.5 px-1 pt-1">
          {config.options.map((item) => {
            const isSelected = item.value === theme
            return (
              <Button
                key={item.key}
                variant="ghost"
                onClick={() => handleSelectTheme(item.value)}
                className={cn(
                  "flex h-9 w-full items-center justify-start gap-2 rounded-lg text-xs font-normal",
                  !isSelected && "text-muted-foreground"
                )}
              >
                {isSelected ? (
                  <CheckIcon className="size-3.5 text-primary" />
                ) : (
                  <span className="size-3.5" aria-hidden="true" />
                )}
                <span>{item.label}</span>
              </Button>
            )
          })}
        </CustomAccordionContent>
      </CustomAccordionItem>
    </CustomAccordion>
  )
}
