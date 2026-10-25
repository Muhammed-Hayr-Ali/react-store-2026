"use client"

/**
 * @file components/not-found.tsx
 * @description Apple-inspired ultra-minimalist NotFound page with a single primary action.
 */

import * as React from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { appRoutes } from "@/lib/config/app-routes"

export default function NotFound() {
  const t = useTranslations("NotFound")

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] w-full flex-col items-center justify-center px-6 py-12">
      <div className="flex w-full max-w-sm flex-col items-center text-center">
        {/* Subtle, refined typographic code */}
        <span className="font-mono text-5xl font-light tracking-tight text-muted-foreground/40 select-none sm:text-6xl">
          404
        </span>

        {/* Clean, Apple-style Heading */}
        <h1 className="mt-5 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {t("TITLE", { default: "Page Not Found" })}
        </h1>
        
        <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground sm:text-sm max-w-xs">
          {t("DESCRIPTION", {
            default: "The page you’re looking for doesn’t exist or has been moved.",
          })}
        </p>

        {/* Single Minimalist Action Button */}
        <div className="mt-8 w-full sm:w-auto">
          <Button 
            asChild 
            size="sm" 
            className="h-10 w-full sm:w-auto text-xs font-medium px-6 rounded-full shadow-none transition-transform active:scale-95"
          >
            <Link href={appRoutes.home}>
              <span>{t("BACK_TO_HOME", { default: "Back to Home" })}</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}