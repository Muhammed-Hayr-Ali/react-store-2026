"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"
import saveTheme from "@/lib/actions/theme-provider/save-theme"
import { COOKIES_KEYS } from "@/lib/config/app_config"

interface CustomThemeProviderProps extends React.ComponentProps<
  typeof NextThemesProvider
> {
  initialTheme?: string
}

export function ThemeProvider({
  initialTheme,
  children,
  ...props
}: CustomThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={initialTheme || "system"}
      enableSystem
      disableTransitionOnChange
      storageKey={COOKIES_KEYS.APP_THEME}
      scriptProps={{ type: "application/json" }}
      {...props}
    >
      <AppThemeProviderHelper />
      {children}
    </NextThemesProvider>
  )
}

/**
 * مكون مساعد لحفظ الثيم الفعلي في الكوكي عند تغييره يدوياً
 */
function AppThemeProviderHelper() {
  const { resolvedTheme } = useTheme()
  const isMounted = React.useRef(false)

  React.useEffect(() => {
    isMounted.current = true
  }, [])

  React.useEffect(() => {
    if (isMounted.current && resolvedTheme) {
      saveTheme(resolvedTheme)
    }
  }, [resolvedTheme])

  return null
}