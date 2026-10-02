"use client"

import React from "react"
import { useTheme } from "next-themes"
import { appConfig } from "@/lib/config/app_config"
import { Button, buttonVariants } from "@/components/ui/button"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  CustomAccordion,
  CustomAccordionContent,
  CustomAccordionItem,
  CustomAccordionTrigger,
} from "@/components/ui/custom-accordion"

export function ThemeAccordion() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  const handleThemeChange = (value: string) => setTheme(value)

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
        <CustomAccordionItem value="item-2">
          <CustomAccordionTrigger
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "flex h-10 items-center justify-start font-normal aria-expanded:bg-transparent"
            )}
          >
            <appConfig.menu.preferences.appearance.icon className="mr-2 size-4 rtl:mr-0 rtl:ml-2" />
            <span>{appConfig.menu.preferences.appearance.name}</span>
          </CustomAccordionTrigger>

          <CustomAccordionContent className="flex flex-col px-2">
            {appConfig.menu.preferences.appearance.options.map((item) => (
              <Button
                key={item.key}
                variant="ghost"
                disabled
                className="flex items-center justify-start"
              >
                {item.label}
              </Button>
            ))}
          </CustomAccordionContent>
        </CustomAccordionItem>
      </CustomAccordion>
    )
  }

  return (
    <CustomAccordion type="single" collapsible>
      <CustomAccordionItem value="item-2">
        <CustomAccordionTrigger
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "flex h-10 items-center justify-start font-normal aria-expanded:bg-transparent"
          )}
        >
          <appConfig.menu.preferences.appearance.icon className="mr-2 size-4 rtl:mr-0 rtl:ml-2" />
          <span>{appConfig.menu.preferences.appearance.name}</span>
          {currentThemeLabel && (
            <span className="ms-2 text-xs font-semibold text-muted-foreground uppercase">
              ({currentThemeLabel})
            </span>
          )}
        </CustomAccordionTrigger>
        <CustomAccordionContent className="flex flex-col px-2">
          {appConfig.menu.preferences.appearance.options.map((item) => (
            <Button
              key={item.key}
              variant="ghost"
              onClick={() => handleThemeChange(item.value)}
              className={cn("flex items-center justify-start", {
                "font-normal text-muted-foreground": item.value !== theme,
              })}
            >
              {item.value === theme ? (
                <Check className="size-3" />
              ) : (
                <div className="size-3" />
              )}
              {item.label}
            </Button>
          ))}
        </CustomAccordionContent>
      </CustomAccordionItem>
    </CustomAccordion>
  )
}
