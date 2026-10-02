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
import { appConfig } from "@/lib/config/app_config"
import { cn } from "@/lib/utils"

export function ThemeAccordion() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMounted(true)
    })
    return () => cancelAnimationFrame(frame)
  }, [])

  const currentThemeLabel =
    appConfig.menu.preferences.appearance.options.find(
      (opt) => opt.value === theme
    )?.key || theme

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
              <appConfig.menu.preferences.appearance.icon className="size-4 text-muted-foreground" />
              <span>{appConfig.menu.preferences.appearance.name}</span>
            </div>
          </CustomAccordionTrigger>
          <CustomAccordionContent className="flex flex-col gap-0.5 px-1 pt-1">
            {appConfig.menu.preferences.appearance.options.map((item) => (
              <Button
                key={item.key}
                variant="ghost"
                disabled
                className="flex h-9 w-full items-center justify-start gap-2 rounded-lg text-xs font-normal"
              >
                <span className="size-3.5" />
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
            <appConfig.menu.preferences.appearance.icon className="size-4 text-muted-foreground" />
            <span>{appConfig.menu.preferences.appearance.name}</span>
          </div>
          {currentThemeLabel && (
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              ({currentThemeLabel})
            </span>
          )}
        </CustomAccordionTrigger>

        <CustomAccordionContent className="flex flex-col gap-0.5 px-1 pt-1">
          {appConfig.menu.preferences.appearance.options.map((item) => {
            const isSelected = item.value === theme
            return (
              <Button
                key={item.key}
                variant="ghost"
                onClick={() => setTheme(item.value)}
                className={cn(
                  "flex h-9 w-full items-center justify-start gap-2 rounded-lg text-xs font-normal",
                  !isSelected && "text-muted-foreground"
                )}
              >
                {isSelected ? (
                  <CheckIcon className="size-3.5 text-primary" />
                ) : (
                  <span className="size-3.5" />
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
