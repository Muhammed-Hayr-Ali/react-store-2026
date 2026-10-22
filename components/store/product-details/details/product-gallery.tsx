"use client"

/**
 * @file components/store/product-details/details/product-gallery.tsx
 * @description Apple-inspired minimalist product gallery with clean render-phase mounting and direct state management.
 */

import * as React from "react"
import { createPortal } from "react-dom"
import {
  AlertCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExpandIcon,
  ImageIcon,
  XIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type {
  ProductImageDetail,
  ProductVariantDetail,
} from "@/lib/actions/store/product-details/details/queries/get-product-details"
import { useTranslations } from "next-intl"
import { Badge } from "@/components/ui/badge"

interface ProductGalleryProps {
  images: ProductImageDetail[]
  variants: ProductVariantDetail[]
  productName: string
  selectedVariantSku?: string
  isOutOfStock?: boolean
  discountPercentage?: number | null
  onVariantSelect: (variant: ProductVariantDetail) => void
}

export function ProductGallery({
  images,
  variants,
  productName,
  selectedVariantSku,
  isOutOfStock = false,
  discountPercentage = null,
  onVariantSelect,
}: ProductGalleryProps) {
  const t = useTranslations("ProductDetails")
  const [isOpen, setIsOpen] = React.useState(false)
  const [failedImages, setFailedImages] = React.useState<
    Record<string, boolean>
  >({})

  // تحديد هل نحن في المتصفح أم لا (بدون useEffect)
  const isBrowser = typeof window !== "undefined"

  const primaryImage = images.find((img) => img.is_primary) || images[0]
  const activeVariantImage = images.find(
    (img) => img.variant_sku === selectedVariantSku
  )
  const activeImage = activeVariantImage?.url || primaryImage?.url || ""

  const markImageAsFailed = (url: string) => {
    setFailedImages((prev) => ({ ...prev, [url]: true }))
  }

  const isMainImageFailed = Boolean(failedImages[activeImage])

  const currentIndex = React.useMemo(() => {
    const idx = images.findIndex((img) => img.url === activeImage)
    return idx >= 0 ? idx : 0
  }, [images, activeImage])

  const handleImageChange = React.useCallback(
    (targetImage: ProductImageDetail) => {
      if (targetImage?.variant_sku) {
        const matchedVariant = variants.find(
          (v) => v.sku === targetImage.variant_sku
        )
        if (matchedVariant) {
          onVariantSelect(matchedVariant)
        }
      }
    },
    [variants, onVariantSelect]
  )

  const handlePrev = React.useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation()
      const nextIdx = (currentIndex - 1 + images.length) % images.length
      handleImageChange(images[nextIdx])
    },
    [currentIndex, images, handleImageChange]
  )

  const handleNext = React.useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation()
      const nextIdx = (currentIndex + 1) % images.length
      handleImageChange(images[nextIdx])
    },
    [currentIndex, images, handleImageChange]
  )

  // الاستماع لاختصارات لوحة المفاتيح فقط عند فتح المعرض
  React.useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false)
      if (e.key === "ArrowLeft") handlePrev()
      if (e.key === "ArrowRight") handleNext()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, handlePrev, handleNext])

  // التحكم في السكرول مباشرة عند تغيير حالة الـ isOpen عبر الأحداث
  const toggleLightbox = (open: boolean) => {
    setIsOpen(open)
    if (isBrowser) {
      document.body.style.overflow = open ? "hidden" : "unset"
    }
  }

  // =================================================================
  // 3. قسم نافذة المعرض بملء الشاشة (Fullscreen Lightbox Portal)
  // =================================================================
  const lightboxContent =
    isOpen && isBrowser
      ? createPortal(
          <div
            role="dialog"
            aria-modal="true"
            onClick={() => toggleLightbox(false)}
            className="fixed inset-0 z-50 flex animate-in flex-col items-center justify-between bg-background/95 p-4 backdrop-blur-2xl duration-300 fade-in sm:p-8"
          >
            {/* شريط رأس النافذة (عداد الصور وزر الإغلاق) */}
            <div className="flex w-full max-w-6xl items-center justify-between text-foreground">
              <Badge variant="secondary">
                <span className="text-xs font-normal">
                  {currentIndex + 1} / {images.length}
                </span>
              </Badge>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => toggleLightbox(false)}
                className="size-10 rounded-full bg-muted text-foreground transition-transform hover:scale-105 active:scale-95"
                aria-label={t("CLOSE_GALLERY", { default: "Close" })}
              >
                <XIcon className="size-5" />
              </Button>
            </div>

            {/* محتوى الصورة الرئيسية بملء الشاشة مع أزرار التنقل الجانبية */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative flex max-h-[72vh] w-full max-w-6xl flex-1 items-center justify-center"
            >
              {images.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handlePrev}
                  className="absolute -inset-s-2.5 z-10 size-10 rounded-full bg-muted/80 text-foreground backdrop-blur-md transition-all hover:scale-105 active:scale-95 sm:inset-s-6"
                  aria-label={t("PREVIOUS_IMAGE", { default: "Previous" })}
                >
                  <ChevronLeftIcon className="size-6 rtl:rotate-180" />
                </Button>
              )}

              <div className="relative flex max-h-full max-w-full items-center justify-center">
                {!isMainImageFailed ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={activeImage}
                    alt={productName}
                    onError={() => markImageAsFailed(activeImage)}
                    className="max-h-[70vh] max-w-full rounded-sm object-contain object-center transition-transform duration-500"
                  />
                ) : (
                  <div className="flex size-64 flex-col items-center justify-center text-muted-foreground">
                    <ImageIcon className="size-16 stroke-[1.5]" />
                    <span className="mt-2 text-sm">
                      {t("IMAGE_UNAVAILABLE", { default: "Unavailable" })}
                    </span>
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleNext}
                  className="absolute -inset-e-2 z-10 size-10 rounded-full bg-muted/80 text-foreground backdrop-blur-md transition-all hover:scale-105 active:scale-95 sm:inset-e-6"
                  aria-label={t("NEXT_IMAGE", { default: "Next" })}
                >
                  <ChevronRightIcon className="size-6 rtl:rotate-180" />
                </Button>
              )}
            </div>

            {/* شريط الصور المصغرة السفلي داخل نافذة ملء الشاشة */}
            {images.length > 1 && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex max-w-full scrollbar-none items-center gap-3 overflow-x-auto scroll-smooth rounded-sm bg-muted/50 p-2.5 backdrop-blur-xl [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              >
                {images.map((img) => {
                  const isSelected = activeImage === img.url
                  const isFailed = Boolean(failedImages[img.url])

                  return (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => handleImageChange(img)}
                      className={`relative size-16 shrink-0 cursor-pointer overflow-hidden rounded-sm transition-all duration-300 ${
                        isSelected
                          ? "opacity-100 ring-1 ring-foreground ring-offset-1"
                          : "opacity-40 hover:opacity-100"
                      }`}
                    >
                      {!isFailed ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={img.url}
                          alt={img.alt_text || productName}
                          onError={() => markImageAsFailed(img.url)}
                          className="size-full object-contain object-center"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center bg-muted text-muted-foreground">
                          <ImageIcon className="size-4" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>,
          document.body
        )
      : null

  return (
    <>
      <div className="w-full space-y-4">
        {/* ================================================================= */}
        {/* 1. قسم عرض الصورة الرئيسية (Main Product Image Section) */}
        {/* ================================================================= */}
        <div
          onClick={() =>
            activeImage && !isMainImageFailed && toggleLightbox(true)
          }
          className={`group relative aspect-square w-full overflow-hidden rounded-lg bg-muted transition-all duration-500 ${
            activeImage && !isMainImageFailed ? "cursor-zoom-in" : ""
          }`}
        >
          {activeImage && !isMainImageFailed ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeImage}
                alt={productName}
                onError={() => markImageAsFailed(activeImage)}
                className="size-full object-contain object-center transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 backdrop-blur-[2px] transition-all duration-300 group-hover:opacity-100">
                <span className="inline-flex translate-y-1 items-center gap-2 rounded-full bg-background/90 px-4 py-2 text-xs font-medium text-foreground shadow-sm backdrop-blur-md transition-transform duration-300 group-hover:translate-y-0">
                  <ExpandIcon className="size-3.5 text-muted-foreground" />
                  <span>
                    {t("VIEW_FULL_SCREEN", { default: "Fullscreen" })}
                  </span>
                </span>
              </div>
            </>
          ) : (
            <div className="flex size-full flex-col items-center justify-center text-sm text-muted-foreground">
              <AlertCircleIcon className="mb-2 size-8 opacity-30" />
              <span>{t("NO_IMAGE", { default: "No image available" })}</span>
            </div>
          )}

          {!isOutOfStock && discountPercentage && (
            <span className="absolute inset-s-5 top-5 z-10 rounded-full bg-foreground px-3.5 py-1 text-[11px] font-semibold text-background shadow-sm">
              {discountPercentage}% {t("OFF", { default: "OFF" })}
            </span>
          )}
        </div>

        {/* ================================================================= */}
        {/* 2. قسم شريط الصور المصغرة للتنقل (Thumbnails Carousel Section) */}
        {/* ================================================================= */}
        {images.length > 1 && (
          <div className="flex touch-pan-x scrollbar-none items-center gap-3 overflow-x-auto scroll-smooth p-1 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {images.map((img) => {
              const isSelected = activeImage === img.url
              const isFailed = Boolean(failedImages[img.url])

              return (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => handleImageChange(img)}
                  className={`group relative size-20 shrink-0 cursor-pointer overflow-hidden rounded-sm bg-muted transition-all duration-300 ${
                    isSelected
                      ? "opacity-100 ring-1 ring-foreground ring-offset-1"
                      : "opacity-40 hover:opacity-100"
                  }`}
                  aria-label={t("SELECT_PRODUCT_IMAGE", {
                    default: "Select image",
                  })}
                >
                  {!isFailed ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={img.url}
                      alt={img.alt_text || productName}
                      onError={() => markImageAsFailed(img.url)}
                      className="size-full object-contain object-center transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center text-muted-foreground">
                      <ImageIcon className="size-4" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* ================================================================= */}
      {/* 3. قسم نافذة المعرض بملء الشاشة عبر البوابة (Fullscreen Lightbox Portal) */}
      {/* ================================================================= */}
      {lightboxContent}
    </>
  )
}
