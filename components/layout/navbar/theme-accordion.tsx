"use client"

import React from "react"
import { useTheme } from "next-themes"
import { appConfig } from "@/lib/config/app_config"
import { Button, buttonVariants } from "@/components/ui/button"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { CustomAccordion, CustomAccordionContent, CustomAccordionItem, CustomAccordionTrigger } from "@/components/ui/custom-accordion"

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

  if (!mounted) {
    return (
      <CustomAccordion type="single" collapsible>
        <CustomAccordionItem value="item-2">
          <CustomAccordionTrigger>
            <div className="flex items-center gap-1 rtl:flex-row-reverse">
              <appConfig.menu.preferences.appearance.icon className="size-5" />{" "}
              <p>{appConfig.menu.preferences.appearance.name}</p>
            </div>
          </CustomAccordionTrigger>

          <CustomAccordionContent className="flex flex-col">
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
          {appConfig.menu.preferences.appearance.name}
        </CustomAccordionTrigger>
        <CustomAccordionContent className="flex flex-col">
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
