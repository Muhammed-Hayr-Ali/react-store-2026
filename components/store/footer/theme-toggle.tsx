"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Loader2, MoonIcon, SunIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMounted(true)
    })
    return () => cancelAnimationFrame(frame)
  }, [])

  if (!mounted) {
    return (
      <Button
        variant="secondary"
        size="icon"
        className="size-8 rounded-lg"
        disabled
        aria-label="Toggle theme"
      >
        <Loader2 className="size-4 animate-spin text-muted-foreground" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  const isDark = theme === "dark"

  return (
    <Button
      variant="secondary"
      size="icon"
      className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <SunIcon className="text-warning size-4" />
      ) : (
        <MoonIcon className="size-4" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
