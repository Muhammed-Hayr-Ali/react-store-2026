"use client"

/**
 * @file components/store/promo-modal/promo-modal-client.tsx
 * @description مكوّن الإعلان الترويجي في منتصف الشاشة مع دعم RTL/LTR وحفظ الإغلاق للجلسة الحالية.
 */

import * as React from "react"
import { useLocale, useTranslations } from "next-intl"
import { ArrowLeftIcon, ArrowRightIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Link } from "@/i18n/navigation"
import type { ActivePromoBanner } from "@/lib/actions/store/queries/get-active-promo-banner"
import { Button } from "@/components/ui/button"

interface PromoModalClientProps {
  banner: ActivePromoBanner
}

const STORAGE_KEY_PREFIX = "marketna_promo_dismissed_"
const SHOW_DELAY_MS = 700

export function PromoModalClient({ banner }: PromoModalClientProps) {
  const t = useTranslations("PromoModal")
  const locale = useLocale()
  const isRtl = locale === "ar"

  const [open, setOpen] = React.useState(false)
  const [failedImageUrl, setFailedImageUrl] = React.useState<string | null>(null)

  const storageKey = `${STORAGE_KEY_PREFIX}${banner.id}`

  React.useEffect(() => {
    try {
      if (window.sessionStorage.getItem(storageKey) === "1") {
        return
      }
    } catch {
      // تجاهل أخطاء التخزين في بيئات التصفح المقيدة
    }

    const timer = window.setTimeout(() => {
      setOpen(true)
    }, SHOW_DELAY_MS)

    return () => window.clearTimeout(timer)
  }, [storageKey])

  const dismissBanner = React.useCallback(() => {
    setOpen(false)
    try {
      window.sessionStorage.setItem(storageKey, "1")
    } catch {
      // تجاهل أخطاء التخزين
    }
  }, [storageKey])

  React.useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        dismissBanner()
      }
    }

    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open, dismissBanner])

  if (!open) return null

  const title = (isRtl && banner.title_ar) || banner.title
  const subtitle = (isRtl && banner.subtitle_ar) || banner.subtitle
  const badgeText = (isRtl && banner.badge_text_ar) || banner.badge_text
  const ctaLabel =
    (isRtl && banner.cta_label_ar) || banner.cta_label || t("DEFAULT_CTA")
  const ctaHref = banner.cta_href || "/products"

  const showImage =
    Boolean(banner.image_url) && failedImageUrl !== banner.image_url

  const ArrowIcon = isRtl ? ArrowLeftIcon : ArrowRightIcon

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      dir={isRtl ? "rtl" : "ltr"}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* خلفية داكنة مصنفرة */}
      <div
        aria-hidden="true"
        onClick={dismissBanner}
        className="fixed inset-0 bg-black/45 backdrop-blur-md transition-opacity duration-200"
      />

      {/* بطاقة الإعلان المتمركزة في منتصف الشاشة */}
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-border/60 bg-background/95 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
        {/* زر الإغلاق */}
        <button
          type="button"
          onClick={dismissBanner}
          aria-label={t("CLOSE")}
          className="absolute inset-e-3.5 top-3.5 z-20 flex size-8 items-center justify-center rounded-full bg-background/85 text-muted-foreground backdrop-blur-md transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <XIcon aria-hidden="true" className="size-4" />
        </button>

        {/* صورة الإعلان العلوية إن وجدت */}
        {showImage && (
          <div className="relative aspect-16/9 w-full overflow-hidden bg-muted/50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={banner.image_url!}
              alt={banner.image_alt || title}
              onError={() => setFailedImageUrl(banner.image_url ?? null)}
              className="size-full object-cover"
            />
          </div>
        )}

        {/* محتوى الإعلان */}
        <div className="flex flex-col items-start gap-3 p-5 text-start sm:p-6">
          {badgeText && (
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {badgeText}
            </span>
          )}

          <h2 className="text-xl leading-snug font-bold tracking-tight text-foreground sm:text-2xl">
            {title}
          </h2>

          {subtitle && (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {subtitle}
            </p>
          )}

          <div className="mt-2 flex w-full flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={dismissBanner}
              className="h-10 rounded-xl px-4 text-xs sm:h-9"
            >
              {t("DISMISS")}
            </Button>

            <Button
              asChild
              onClick={dismissBanner}
              className="h-10 rounded-xl px-5 text-xs font-semibold sm:h-9"
            >
              <Link href={ctaHref} className="inline-flex items-center gap-1.5">
                <span>{ctaLabel}</span>
                <ArrowIcon
                  aria-hidden="true"
                  className={cn("size-3.5 transition-transform")}
                />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}