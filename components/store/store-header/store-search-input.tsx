"use client"

import * as React from "react"
import { useLocale, useTranslations } from "next-intl"
import { SearchIcon } from "lucide-react"
import { TypewriterClass } from "typewriter-effect"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { useRouter } from "@/i18n/navigation"
import { APP_ROUTES } from "@/lib/config/app-routes"

// text-base على الجوال: أي خط أصغر من 16px يجعل iOS يكبّر الصفحة عند التركيز
const searchInputVariants = cva(
  "w-full appearance-none rounded-xl border border-border/80 text-base font-normal transition-all outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:bg-background focus:ring-2 focus:ring-primary/15 md:text-[13px] [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden",
  {
    variants: {
      variant: {
        default: "h-11 bg-muted/40 ps-4 pe-11",
        compact: "h-10 bg-muted/40 ps-3.5 pe-11",
        sticky: "h-10 bg-background ps-3.5 pe-11",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface StoreSearchInputProps
  extends VariantProps<typeof searchInputVariants> {
  className?: string
  inputClassName?: string
}

export function StoreSearchInput({
  variant,
  className,
  inputClassName,
}: StoreSearchInputProps) {
  const t = useTranslations("StoreHeader")
  const locale = useLocale()
  const router = useRouter()

  const formRef = React.useRef<HTMLFormElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [query, setQuery] = React.useState("")
  const [isFocused, setIsFocused] = React.useState(false)
  const [isVisible, setIsVisible] = React.useState(true)

  const prefix = t("searchPlaceholderPrefix")
  const phrases = React.useMemo(() => {
    const raw = t.raw("searchPlaceholders")
    return Array.isArray(raw) ? (raw as string[]) : []
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, locale])

  // مراقبة ظهور الحقل على الشاشة حتى لا تعمل 3 مؤقتات في وقت واحد
  React.useEffect(() => {
    const el = formRef.current
    if (!el || typeof IntersectionObserver === "undefined") return

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  React.useEffect(() => {
    const input = inputRef.current
    if (!input || phrases.length === 0) return

    // احترام إعداد تقليل الحركة في الجهاز
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    if (
      prefersReducedMotion ||
      !isVisible ||
      isFocused ||
      query.trim().length > 0
    ) {
      input.placeholder = `${prefix}${phrases[0]}`
      return
    }

    let currentText = ""
    input.placeholder = prefix

    const typewriter = new TypewriterClass(null, {
      loop: true,
      delay: 55,
      deleteSpeed: 30,
      useGraphemeSplitter: true,
      onCreateTextNode: (character: string) => {
        currentText += character
        if (inputRef.current) {
          inputRef.current.placeholder = `${prefix}${currentText}`
        }
        return null
      },
      onRemoveNode: ({ character }: { character?: string }) => {
        if (character && currentText.length > 0) {
          currentText = currentText.slice(0, -character.length)
          if (inputRef.current) {
            inputRef.current.placeholder = `${prefix}${currentText}`
          }
        }
      },
    })

    for (const phrase of phrases) {
      typewriter.typeString(phrase).pauseFor(1800).deleteAll(25).pauseFor(350)
    }

    typewriter.start()

    return () => {
      typewriter.stop()
    }
  }, [locale, prefix, phrases, isVisible, isFocused, query])

  // التنقل عبر راوتر next-intl يحافظ على بادئة اللغة (نموذج GET العادي كان يتجاوزها)
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = query.trim()

    if (!trimmed) {
      inputRef.current?.focus()
      return
    }

    inputRef.current?.blur()
    router.push(`${APP_ROUTES.SEARCH}?q=${encodeURIComponent(trimmed)}`)
  }

  return (
    <form
      ref={formRef}
      role="search"
      action={APP_ROUTES.SEARCH}
      method="GET"
      onSubmit={handleSubmit}
      className={cn("relative w-full", className)}
    >
      <input
        ref={inputRef}
        type="search"
        name="q"
        enterKeyHint="search"
        autoComplete="off"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={`${prefix}${phrases[0] ?? ""}`}
        aria-label={t("searchPlaceholder")}
        className={cn(searchInputVariants({ variant }), inputClassName)}
      />

      {/* الأيقونة صارت زر إرسال فعلياً بدل أيقونة زخرفية */}
      <button
        type="submit"
        aria-label={t("search")}
        className="absolute inset-e-1 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/60"
      >
        <SearchIcon aria-hidden="true" className="size-4" />
      </button>
    </form>
  )
}
