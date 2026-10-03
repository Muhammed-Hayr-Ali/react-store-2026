"use client"

import { useTheme } from "next-themes"
import { Loader2, MoonIcon, SunIcon } from "lucide-react"
import React from "react"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  const handleThemeChange = (value: string) => setTheme(value)

  React.useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMounted(true)
    })

    return () => cancelAnimationFrame(frame)
  }, [])


  if(!mounted) {
    return (
      <Button
        variant="secondary"
        size="icon-lg"
        onClick={() => handleThemeChange(theme === "dark" ? "light" : "dark")}
        aria-label="Toggle theme"
      >
        <Loader2 className="animate-spin" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  return (
    <Button
      variant="secondary"
      size="icon-lg"
      onClick={() => handleThemeChange(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
