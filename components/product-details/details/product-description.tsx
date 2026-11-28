"use client"

/**
 * @file components/store/product-details/details/product-description.tsx
 * @description Collapsible product description section.
 */

import { useTranslations } from "next-intl"
import { ChevronDownIcon } from "lucide-react"

interface ProductDescriptionProps {
  description: string
}

export function ProductDescription({ description }: ProductDescriptionProps) {
  const t = useTranslations("ProductDetails")

  return (
    <details open className="group border-t border-border/60 pt-4">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-md py-1 text-sm font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
        {t("DESCRIPTION")}
        <ChevronDownIcon className="size-4 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>
      <p
        dir="auto"
        className="pt-3 text-sm leading-7 whitespace-pre-line text-muted-foreground"
      >
        {description}
      </p>
    </details>
  )
}
