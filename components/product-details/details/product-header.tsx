"use client"

/**
 * @file components/store/product-details/details/product-header.tsx
 * @description Apple-inspired minimalist product header and description.
 */

import * as React from "react"

interface ProductHeaderProps {
  name: string
  description?: string | null
}

export function ProductHeader({ name, description }: ProductHeaderProps) {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {name}
      </h1>
      {description && (
        <p className="text-sm leading-relaxed text-muted-foreground/90">
          {description}
        </p>
      )}
    </div>
  )
}