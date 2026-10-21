"use client"

/**
 * @file components/store/product-details/details/product-header.tsx
 * @description Displays the product name and its detailed description.
 */

import * as React from "react"

interface ProductHeaderProps {
  name: string
  description?: string | null
}

export function ProductHeader({ name, description }: ProductHeaderProps) {
  return (
    <div className="space-y-3">
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
        {name}
      </h1>
      {description && (
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  )
}