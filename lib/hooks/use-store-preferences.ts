"use client"

import * as React from "react"
import { useLocale } from "next-intl"
import { usePathname, useRouter } from "@/i18n/navigation"
import { useTheme } from "next-themes"

import { useCurrency } from "@/lib/context/currency-context"

/* -------------------------------------------------------------------------- */
/* هوك مساعد لتجنب تعارض Hydration بعد اكتمال التحميل على العميل              */
/* -------------------------------------------------------------------------- */
export function useIsMounted() {
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    const frame = requestAnimationFrame(() => setIsMounted(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  return isMounted
}

/* -------------------------------------------------------------------------- */
/* 1. هوك ودالة تعديل اللغة (next-intl + useTransition + useOptimistic)       */
/* -------------------------------------------------------------------------- */
export function useLanguagePreference() {
  const router = useRouter()
  const pathname = usePathname()
  const currentLocale = useLocale()
  const isMounted = useIsMounted()

  const [isPending, startTransition] = React.useTransition()
  const [optimisticLocale, setOptimisticLocale] = React.useOptimistic(
    currentLocale,
    (_current, next: string) => next
  )

  const handleLanguageChange = React.useCallback(
    (nextLocale: string) => {
      if (nextLocale === optimisticLocale || isPending) return

      startTransition(() => {
        setOptimisticLocale(nextLocale)
        router.replace(pathname, { locale: nextLocale })
      })
    },
    [isPending, optimisticLocale, pathname, router, setOptimisticLocale]
  )

  return {
    currentLocale,
    optimisticLocale,
    isMounted,
    isPending,
    handleLanguageChange,
  }
}

/* -------------------------------------------------------------------------- */
/* 2. هوك ودالة تعديل المظهر / الثيم (next-themes)                            */
/* -------------------------------------------------------------------------- */
export function useThemePreference() {
  const { theme, setTheme } = useTheme()
  const isMounted = useIsMounted()
  const [isPending, setIsPending] = React.useState(false)
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const handleThemeChange = React.useCallback(
    (nextTheme: string) => {
      if (nextTheme === theme || isPending) return

      setIsPending(true)
      timeoutRef.current = setTimeout(() => {
        setTheme(nextTheme)
        setIsPending(false)
      }, 220)
    },
    [isPending, setTheme, theme]
  )

  return {
    theme,
    isMounted,
    isPending,
    handleThemeChange,
  }
}

/* -------------------------------------------------------------------------- */
/* 3. هوك ودالة تعديل العملة (CurrencyContext)                                 */
/* -------------------------------------------------------------------------- */
export function useCurrencyPreference() {
  const { currentCurrency, setCurrency } = useCurrency()
  const isMounted = useIsMounted()
  const [isPending, setIsPending] = React.useState(false)
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const handleCurrencyChange = React.useCallback(
    (nextCurrencyCode: string) => {
      if (nextCurrencyCode === currentCurrency.code || isPending) return

      setIsPending(true)
      timeoutRef.current = setTimeout(() => {
        setCurrency(nextCurrencyCode)
        setIsPending(false)
      }, 200)
    },
    [currentCurrency.code, isPending, setCurrency]
  )

  return {
    currentCurrency,
    isMounted,
    isPending,
    handleCurrencyChange,
  }
}