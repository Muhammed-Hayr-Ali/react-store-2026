"use client"

/**
 * @file components/store/product-details/details/product-gallery.tsx
 * @description Apple-inspired minimalist product gallery with smooth lightbox and variant integration.
 */

import * as React from "react"
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

  return (
    <>
      <div className="w-full space-y-4">
        {/* الصورة الرئيسية بأسلوب أبل: خلفية ناعمة وزوايا دائرية منسابة */}
        <div
          onClick={() => activeImage && !isMainImageFailed && setIsOpen(true)}
          className={`group relative aspect-square w-full overflow-hidden rounded-3xl bg-muted/40 transition-all duration-500 ${
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
                className="size-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 backdrop-blur-[2px] transition-all duration-300 group-hover:opacity-100">
                <span className="inline-flex items-center gap-2 rounded-full bg-background/90 px-4 py-2 text-xs font-medium text-foreground shadow-sm backdrop-blur-md transition-transform duration-300 translate-y-1 group-hover:translate-y-0">
                  <ExpandIcon className="size-3.5 text-muted-foreground" />
                  <span>{t("VIEW_FULL_SCREEN", { default: "Fullscreen" })}</span>
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

        {/* شريط الصور المصغرة بتصميم Minimalist هادئ */}
        {images.length > 1 && (
          <div className="flex touch-pan-x scrollbar-none items-center gap-3 overflow-x-auto scroll-smooth py-1 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {images.map((img) => {
              const isSelected = activeImage === img.url
              const isFailed = Boolean(failedImages[img.url])

              return (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => handleImageChange(img)}
                  className={`group relative size-20 shrink-0 cursor-pointer overflow-hidden rounded-2xl bg-muted/30 transition-all duration-300 ${
                    isSelected
                      ? "ring-2 ring-foreground ring-offset-2 scale-100 opacity-100"
                      : "opacity-50 hover:opacity-100 hover:scale-95"
                  }`}
                  aria-label={t("SELECT_PRODUCT_IMAGE", { default: "Select image" })}
                >
                  {!isFailed ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={img.url}
                      alt={img.alt_text || productName}
                      onError={() => markImageAsFailed(img.url)}
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
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

      {/* نافذة التكبير بملء الشاشة بأسلوب نظيف وفاخر */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-50 flex animate-in flex-col items-center justify-between bg-background/95 p-6 backdrop-blur-2xl duration-300 fade-in sm:p-8"
        >
          <div className="flex w-full max-w-6xl items-center justify-between text-foreground">
            <span className="text-xs font-medium text-muted-foreground">
              {currentIndex + 1} / {images.length}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="size-10 rounded-full bg-muted text-foreground transition-transform hover:scale-105 active:scale-95"
              aria-label={t("CLOSE_GALLERY", { default: "Close" })}
            >
              <XIcon className="size-5" />
            </Button>
          </div>

          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex max-h-[72vh] w-full max-w-6xl flex-1 items-center justify-center p-2"
          >
            {images.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handlePrev}
                className="absolute inset-s-2 z-10 size-12 rounded-full bg-muted/80 text-foreground backdrop-blur-md transition-all hover:scale-105 active:scale-95 sm:inset-s-6"
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
                  className="max-h-[70vh] max-w-full rounded-3xl object-contain shadow-2xl transition-transform duration-500"
                />
              ) : (
                <div className="flex size-64 flex-col items-center justify-center text-muted-foreground">
                  <ImageIcon className="size-16 stroke-[1.5]" />
                  <span className="mt-2 text-sm">{t("IMAGE_UNAVAILABLE", { default: "Unavailable" })}</span>
                </div>
              )}
            </div>

            {images.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleNext}
                className="absolute inset-e-2 z-10 size-12 rounded-full bg-muted/80 text-foreground backdrop-blur-md transition-all hover:scale-105 active:scale-95 sm:inset-e-6"
                aria-label={t("NEXT_IMAGE", { default: "Next" })}
              >
                <ChevronRightIcon className="size-6 rtl:rotate-180" />
              </Button>
            )}
          </div>

          {images.length > 1 && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex max-w-full scrollbar-none items-center gap-3 overflow-x-auto scroll-smooth rounded-2xl bg-muted/60 p-3 backdrop-blur-xl [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {images.map((img) => {
                const isSelected = activeImage === img.url
                const isFailed = Boolean(failedImages[img.url])

                return (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => handleImageChange(img)}
                    className={`relative size-16 shrink-0 cursor-pointer overflow-hidden rounded-xl transition-all duration-300 ${
                      isSelected
                        ? "ring-2 ring-foreground scale-105 opacity-100"
                        : "opacity-40 hover:scale-95 hover:opacity-100"
                    }`}
                  >
                    {!isFailed ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={img.url}
                        alt={img.alt_text || productName}
                        onError={() => markImageAsFailed(img.url)}
                        className="size-full object-cover"
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
        </div>
      )}
    </>
  )
}