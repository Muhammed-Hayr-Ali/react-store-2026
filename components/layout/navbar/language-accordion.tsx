"use client"

import { Button, buttonVariants } from "@/components/ui/button"
import { CustomAccordion, CustomAccordionContent, CustomAccordionItem, CustomAccordionTrigger } from "@/components/ui/custom-accordion"
import { appConfig } from "@/lib/config/app_config"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"
import { useLocale } from "next-intl"
import { usePathname, useRouter } from "next/navigation"
export function LanguageAccordion() {
  const router = useRouter()
  const pathname = usePathname()
  const currentLocale = useLocale()

  // handle Locale Change nurmale function
  const handleLocaleChange = (locale: string) => {
    router.replace(`/${locale}${pathname}`)
  }

  return (
    <CustomAccordion type="single" collapsible>
      <CustomAccordionItem value="item-1">
        <CustomAccordionTrigger
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "flex h-10 items-center justify-start font-normal aria-expanded:bg-transparent"
          )}
        >
          <appConfig.menu.preferences.language.icon className="mr-2 size-4 rtl:mr-0 rtl:ml-2" />
          {appConfig.menu.preferences.language.name}
        </CustomAccordionTrigger>
        <CustomAccordionContent className="flex flex-col px-2">
          {appConfig.menu.preferences.language.options.map((item) => (
            <Button
              key={item.key}
              variant="ghost"
              onClick={() => handleLocaleChange(item.value)}
              className={cn("flex items-center justify-start", {
                "font-normal text-muted-foreground":
                  item.value !== currentLocale,
              })}
            >
              {item.key === currentLocale ? (
                <Check className="h-4 w-4" />
              ) : (
                <div className="h-4 w-4" />
              )}
              {item.label}
            </Button>
          ))}
        </CustomAccordionContent>
      </CustomAccordionItem>
    </CustomAccordion>
  )
}
