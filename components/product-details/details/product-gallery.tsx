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
  selectedVariantId?: string
  isOutOfStock?: boolean
  discountPercentage?: number | null
  onVariantSelect: (variant: ProductVariantDetail) => void
}

export function ProductGallery({
  images,
  variants,
  productName,
  selectedVariantId,
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

  // الصورة المناسبة للمتغير: صورته، ثم صورة عامة رئيسية، ثم أي صورة
  const getVariantImage = (variantId?: string) => {
    const own = images.filter((img) => img.variant_id === variantId)
    const general = images.filter((img) => !img.variant_id)
    const pick = (list: ProductImageDetail[]) =>
      list.find((img) => img.is_primary) ?? list[0]
    return pick(own) ?? pick(general) ?? pick(images)
  }

  // نخزن الصورة المختارة حتى تعمل الصور العامة والصور المتعددة للمتغير الواحد
  const [selectedImageId, setSelectedImageId] = React.useState(
    () => getVariantImage(selectedVariantId)?.id
  )

  const [prevVariantId, setPrevVariantId] = React.useState(selectedVariantId)
  if (prevVariantId !== selectedVariantId) {
    setPrevVariantId(selectedVariantId)
    const current = images.find((img) => img.id === selectedImageId)
    if (current?.variant_id !== selectedVariantId) {
      setSelectedImageId(getVariantImage(selectedVariantId)?.id)
    }
  }

  const activeImageData =
    images.find((img) => img.id === selectedImageId) ??
    getVariantImage(selectedVariantId)
  const activeImage = activeImageData?.url ?? ""
  const activeAlt = activeImageData?.alt_text || productName

  const markImageAsFailed = (url: string) => {
    setFailedImages((prev) => ({ ...prev, [url]: true }))
  }

  const isMainImageFailed = Boolean(failedImages[activeImage])

  const currentIndex = Math.max(
    0,
    images.findIndex((img) => img.id === activeImageData?.id)
  )

  const handleImageChange = React.useCallback(
    (targetImage: ProductImageDetail) => {
      setSelectedImageId(targetImage.id)

      if (
        targetImage.variant_id &&
        targetImage.variant_id !== selectedVariantId
      ) {
        const matchedVariant = variants.find(
          (v) => v.id === targetImage.variant_id
        )
        if (matchedVariant) {
          onVariantSelect(matchedVariant)
        }
      }
    },
    [variants, selectedVariantId, onVariantSelect]
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

  // اختصارات لوحة المفاتيح، مع مراعاة اتجاه الصفحة
  React.useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const isRtl = document.documentElement.dir === "rtl"
      if (e.key === "Escape") setIsOpen(false)
      if (images.length < 2) return
      if (e.key === (isRtl ? "ArrowRight" : "ArrowLeft")) handlePrev()
      if (e.key === (isRtl ? "ArrowLeft" : "ArrowRight")) handleNext()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, images.length, handlePrev, handleNext])

  // قفل التمرير: يستعاد دائماً عند الإغلاق (بما فيه Escape) أو إزالة المكوّن
  React.useEffect(() => {
    if (!isOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen])

  // =================================================================
  // 3. قسم نافذة المعرض بملء الشاشة (Fullscreen Lightbox Portal)
  // =================================================================
  const lightboxContent =
    isOpen && isBrowser
      ? createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={productName}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-50 flex h-dvh animate-in flex-col justify-between bg-background/95 p-4 backdrop-blur-2xl duration-300 fade-in sm:p-6"
          >
            {/* شريط رأس النافذة (عداد الصور وزر الإغلاق) */}
            <div className="mx-auto flex w-full max-w-6xl shrink-0 items-center justify-between text-foreground">
              <Badge variant="secondary">
                <span className="text-xs font-normal">
                  {currentIndex + 1} / {images.length}
                </span>
              </Badge>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="size-10 rounded-full bg-muted text-foreground transition-transform hover:scale-105 active:scale-95"
                autoFocus
                aria-label={t("CLOSE_GALLERY")}
              >
                <XIcon className="size-5" />
              </Button>
            </div>

            {/* محتوى الصورة الرئيسية بملء الشاشة مع أزرار التنقل الجانبية (متمركزة تماماً في المنتصف) */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative mx-auto flex w-full max-w-6xl flex-1 items-center justify-center overflow-hidden py-4"
            >
              {images.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handlePrev}
                  className="absolute inset-s-2 z-10 size-11 rounded-full bg-muted/80 text-foreground backdrop-blur-md transition-all hover:scale-105 active:scale-95 sm:inset-s-6"
                  aria-label={t("PREVIOUS_IMAGE")}
                >
                  <ChevronLeftIcon className="size-6 rtl:rotate-180" />
                </Button>
              )}

              <div className="flex h-full w-full items-center justify-center">
                {!isMainImageFailed ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={activeImage}
                    alt={activeAlt}
                    onError={() => markImageAsFailed(activeImage)}
                    className="max-h-[75vh] max-w-full object-contain object-center transition-transform duration-500"
                  />
                ) : (
                  <div className="flex size-64 flex-col items-center justify-center text-muted-foreground">
                    <ImageIcon className="size-16 stroke-[1.5]" />
                    <span className="mt-2 text-sm">
                      {t("IMAGE_UNAVAILABLE")}
                    </span>
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleNext}
                  className="absolute inset-e-2 z-10 size-11 rounded-full bg-muted/80 text-foreground backdrop-blur-md transition-all hover:scale-105 active:scale-95 sm:inset-e-6"
                  aria-label={t("NEXT_IMAGE")}
                >
                  <ChevronRightIcon className="size-6 rtl:rotate-180" />
                </Button>
              )}
            </div>

            {/* شريط الصور المصغرة السفلي داخل نافذة ملء الشاشة */}
            {images.length > 1 && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="mx-auto flex max-w-full shrink-0 scrollbar-none items-center justify-center gap-3 overflow-x-auto scroll-smooth rounded-xl bg-muted/50 p-2.5 backdrop-blur-xl [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              >
                {images.map((img) => {
                  const isSelected = activeImageData?.id === img.id
                  const isFailed = Boolean(failedImages[img.url])

                  return (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => handleImageChange(img)}
                      aria-label={t("SELECT_PRODUCT_IMAGE")}
                      aria-pressed={isSelected}
                      className={`group relative size-16 shrink-0 cursor-pointer overflow-hidden rounded-lg bg-muted transition-all duration-300 ${
                        isSelected
                          ? "opacity-100 ring-2 ring-primary ring-offset-2"
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
      <div className="flex w-full flex-col gap-3 xl:flex-row-reverse xl:items-start">
        {/* ================================================================= */}
        {/* 1. قسم عرض الصورة الرئيسية (Main Product Image Section) */}
        {/* ================================================================= */}
        <div
          className={`group relative aspect-square w-full min-w-0 overflow-hidden rounded-3xl border border-border/50 bg-muted/60 xl:flex-1 ${
            activeImage && !isMainImageFailed ? "cursor-zoom-in" : ""
          }`}
        >
          {activeImage && !isMainImageFailed ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeImage}
                alt={activeAlt}
                onError={() => markImageAsFailed(activeImage)}
                className="size-full object-contain object-center transition-transform duration-700 ease-out group-hover:scale-105"
              />
              {/* زر حقيقي يغطي الصورة: يعمل باللمس ولوحة المفاتيح */}
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                aria-label={t("VIEW_FULL_SCREEN")}
                className="absolute inset-0 flex cursor-zoom-in items-end justify-end rounded-3xl p-4 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
              >
                <span className="inline-flex items-center gap-2 rounded-full bg-background/90 p-2.5 sm:px-3.5 sm:py-2 text-xs font-medium text-foreground shadow-sm backdrop-blur-md transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100">
                  <ExpandIcon className="size-3.5 text-muted-foreground" />
                  <span className="hidden sm:inline">
                    {t("VIEW_FULL_SCREEN")}
                  </span>
                </span>
              </button>
            </>
          ) : (
            <div className="flex size-full flex-col items-center justify-center text-sm text-muted-foreground">
              <AlertCircleIcon className="mb-2 size-8 opacity-30" />
              <span>{t("NO_IMAGE")}</span>
            </div>
          )}

          {images.length > 1 && (
            <>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handlePrev}
                aria-label={t("PREVIOUS_IMAGE")}
                className="absolute inset-s-3 top-1/2 z-10 size-10 -translate-y-1/2 rounded-full bg-background/85 shadow-sm backdrop-blur-md md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
              >
                <ChevronLeftIcon className="size-5 rtl:rotate-180" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleNext}
                aria-label={t("NEXT_IMAGE")}
                className="absolute inset-e-3 top-1/2 z-10 size-10 -translate-y-1/2 rounded-full bg-background/85 shadow-sm backdrop-blur-md md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
              >
                <ChevronRightIcon className="size-5 rtl:rotate-180" />
              </Button>
              <span
                className="pointer-events-none absolute inset-s-4 bottom-4 rounded-full bg-background/85 px-3 py-1 text-xs font-medium tabular-nums backdrop-blur-md"
              >
                <bdi dir="ltr">
                  {currentIndex + 1} / {images.length}
                </bdi>
              </span>
            </>
          )}

          {!isOutOfStock && discountPercentage !== null && (
            <span className="absolute inset-s-5 top-5 z-10 rounded-full bg-destructive px-3.5 py-1 text-xs font-semibold text-white shadow-sm">
              {discountPercentage}% {t("OFF")}
            </span>
          )}
        </div>

        {/* ================================================================= */}
        {/* 2. قسم شريط الصور المصغرة للتنقل (Thumbnails Carousel Section) */}
        {/* ================================================================= */}
        {images.length > 1 && (
          <div className="flex touch-pan-x scrollbar-none items-center gap-3 overflow-x-auto scroll-smooth p-1 xl:max-h-[36rem] xl:shrink-0 xl:flex-col xl:overflow-y-auto [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {images.map((img) => {
              const isSelected = activeImageData?.id === img.id
              const isFailed = Boolean(failedImages[img.url])

              return (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => handleImageChange(img)}
                  className={`group relative size-18 shrink-0 cursor-pointer overflow-hidden rounded-xl bg-muted transition-all duration-300 ${
                    isSelected
                      ? "opacity-100 ring-2 ring-foreground ring-inset"
                      : "opacity-60 hover:opacity-100"
                  }`}
                  aria-label={t("SELECT_PRODUCT_IMAGE")}
                  aria-pressed={isSelected}
                >
                  {!isFailed ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={img.url}
                      alt={img.alt_text || productName}
                      onError={() => markImageAsFailed(img.url)}
                      className="size-full object-contain object-center transition-transform duration-500 group-hover:scale-95"
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
