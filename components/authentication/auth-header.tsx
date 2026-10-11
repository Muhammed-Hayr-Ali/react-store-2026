/**
 * @file components/auth/auth-header.tsx
 * @description Standardized typography header for all authentication forms.
 */

import * as React from "react"
import { Link } from "@/i18n/navigation"

interface AuthHeaderProps {
  title: string
  description: string
  linkText?: string
  linkHref?: string
}

export function AuthHeader({
  title,
  description,
  linkText,
  linkHref,
}: AuthHeaderProps) {
  return (
    <div className="flex flex-col space-y-1.5 pb-6 text-start">
      <div className="flex w-full items-center justify-between gap-3">
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          {title}
        </h1>

        {linkText && linkHref && (
          <Link
            href={linkHref}
            className="text-xs font-semibold text-primary underline-offset-4 hover:underline"
          >
            {linkText}
          </Link>
        )}
      </div>

      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  )
}