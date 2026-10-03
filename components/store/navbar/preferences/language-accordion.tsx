"use client"

import * as React from "react"
import { CheckIcon } from "lucide-react"
import { useLocale } from "next-intl"
import { usePathname, useRouter } from "next/navigation"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  CustomAccordion,
  CustomAccordionContent,
  CustomAccordionItem,
  CustomAccordionTrigger,
} from "@/components/ui/custom-accordion"
import { storeNavConfig } from "../nav-config"
import { cn } from "@/lib/utils"

interface LanguageAccordionProps {
  onSelect?: () => void
}

export function LanguageAccordion({ onSelect }: LanguageAccordionProps) {
  const router = useRouter()
  const pathname = usePathname()
  const currentLocale = useLocale()

  const config = storeNavConfig.preferences.language

  const currentOption = config.options.find(
    (opt) => opt.value === currentLocale || opt.key === currentLocale
  )

  const handleLocaleChange = (newLocale: string) => {
    onSelect?.()
    if (newLocale === currentLocale) return

    const segments = pathname.split("/")
    if (segments[1] === currentLocale) {
      segments[1] = newLocale
      router.replace(segments.join("/") || "/")
    } else {
      router.replace(`/${newLocale}${pathname}`)
    }
  }

  return (
    <CustomAccordion type="single" collapsible>
      <CustomAccordionItem value="item-language">
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
          <span className="text-xs font-semibold text-muted-foreground uppercase">
            ({currentOption?.key || currentLocale})
          </span>
        </CustomAccordionTrigger>

        <CustomAccordionContent className="flex flex-col gap-0.5 px-1 pt-1">
          {config.options.map((item) => {
            const isSelected = item.value === currentLocale
            return (
              <Button
                key={item.key}
                variant="ghost"
                onClick={() => handleLocaleChange(item.value)}
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
