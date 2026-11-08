/**
 * @file components/auth/last-used-badge.tsx
 * @description Pulsing indicator dot that renders as a clean circle when collapsed and expands smoothly without leftover spacing.
 */

"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

export default function LastUsedBadge({
  className,
  ...props
}: {
  className?: string
}) {
  const t = useTranslations("GoogleSignInButton")

  return (
    <div className={cn("group relative inline-flex items-center cursor-default", className)} {...props}>
      <div className="flex items-center rounded-full border border-border/80 bg-secondary py-0.75 px-1 shadow-xs transition-all duration-300">
        
        {/* دائرة تومض في المنتصف تماماً عندما يكون النص مخفياً */}
        <span className="relative flex size-2 shrink-0 m-0.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-400 opacity-75 dark:bg-green-500" />
          <span className="relative inline-flex size-2 rounded-full bg-green-500 dark:bg-green-400" />
        </span>

        {/* النص والحشوة المرتبطة به تختفي بنسبة 100% دون ترك أي فراغ */}
        <span className="grid grid-cols-[0fr] opacity-0 transition-all duration-300 ease-in-out group-hover:grid-cols-[1fr] group-hover:opacity-100 group-hover:ms-1.5 group-hover:pe-1">
          <span className="overflow-hidden whitespace-nowrap text-[9px] font-medium tracking-wide text-foreground">
            {t("LAST_USED")}
          </span>
        </span>

      </div>
    </div>
  )
}