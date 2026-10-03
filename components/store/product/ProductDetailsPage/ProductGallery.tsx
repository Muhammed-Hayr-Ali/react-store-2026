"use client"

import * as React from "react"
import {
  AlertCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExpandIcon,
  ImageIcon,
  XIcon,
} from "lucide-react"
import { ProductImageItem } from "./utils"
import { Button } from "@/components/ui/button"

interface ProductGalleryProps {
  activeImage: string
  productName: string
  productImages: ProductImageItem[]
  isOutOfStock: boolean
  discountPercentage: number | null
  onThumbnailClick: (img: ProductImageItem) => void
}

export function ProductGallery({
  activeImage,
  productName,
  productImages,
  isOutOfStock,
  discountPercentage,
  onThumbnailClick,
}: ProductGalleryProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  // تتبع روابط الصور التي فشل تحميلها
  const [failedImages, setFailedImages] = React.useState<
    Record<string, boolean>
  >({})

  const markImageAsFailed = (url: string) => {
    setFailedImages((prev) => ({ ...prev, [url]: true }))
  }

  const isMainImageFailed = Boolean(failedImages[activeImage])

  const currentIndex = React.useMemo(() => {
    const idx = productImages.findIndex((img) => img.url === activeImage)
    return idx >= 0 ? idx : 0
  }, [productImages, activeImage])

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    const nextIdx =
      (currentIndex - 1 + productImages.length) % productImages.length
    onThumbnailClick(productImages[nextIdx])
  }

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    const nextIdx = (currentIndex + 1) % productImages.length
    onThumbnailClick(productImages[nextIdx])
  }

  React.useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false)
      if (e.key === "ArrowLeft") handlePrev()
      if (e.key === "ArrowRight") handleNext()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, currentIndex, productImages])

  return (
    <>
      <div className="space-y-4 lg:col-span-6">
        {/* الصورة الرئيسية المعروضة في الصفحة */}
        <div
          onClick={() => activeImage && !isMainImageFailed && setIsOpen(true)}
          className={`group relative aspect-square w-full overflow-hidden rounded-2xl border border-border/60 bg-muted/20 shadow-xs transition-all duration-300 hover:shadow-md ${
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
                className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 backdrop-blur-[2px] transition-all duration-300 group-hover:opacity-100">
                <span className="inline-flex translate-y-2 items-center gap-1.5 rounded-full bg-background/90 px-3.5 py-1.5 text-xs font-semibold text-foreground shadow-lg backdrop-blur-md transition-transform duration-300 group-hover:translate-y-0">
                  <ExpandIcon className="size-3.5 text-primary" />
                  View Fullscreen
                </span>
              </div>
            </>
          ) : (
            <div className="flex size-full flex-col items-center justify-center text-sm text-muted-foreground">
              <AlertCircleIcon className="mb-2 size-8 opacity-40" />
              <span>No image available</span>
            </div>
          )}

          {!isOutOfStock && discountPercentage && (
            <span className="text-destructive-foreground absolute start-4 top-4 animate-in rounded-full bg-destructive px-3 py-1 text-xs font-medium tracking-wide shadow-md duration-300 zoom-in-90 fade-in text-white">
              {discountPercentage}% OFF
            </span>
          )}
        </div>

        {/* شريط الصور المصغرة */}
        {productImages.length > 1 && (
          <div className="flex touch-pan-x [scrollbar-width:none] items-center gap-3 overflow-x-auto scroll-smooth py-1 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {productImages.map((img) => {
              const isSelected = activeImage === img.url
              const isFailed = Boolean(failedImages[img.url])

              return (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => onThumbnailClick(img)}
                  className={`group relative size-18 shrink-0 cursor-pointer overflow-hidden rounded-xl border bg-background transition-all duration-200 ${
                    isSelected
                      ? "scale-100 border-primary shadow-sm ring-2 ring-primary/30"
                      : "border-border/70 opacity-60 hover:scale-95 hover:border-foreground/40 hover:opacity-100"
                  }`}
                  aria-label="Select product image"
                >
                  {!isFailed ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={img.url}
                      alt={img.alt_text || productName}
                      onError={() => markImageAsFailed(img.url)}
                      className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center bg-muted/40 text-muted-foreground">
                      <ImageIcon className="size-5" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* نافذة التكبير بملء الشاشة */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-50 flex animate-in flex-col items-center justify-between bg-black/90 p-4 backdrop-blur-md duration-200 fade-in sm:p-6"
        >
          {/* شريط الإغلاق العلوي */}
          <div className="flex w-full max-w-5xl items-center justify-between text-white">
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium tracking-widest text-white/80 backdrop-blur-md">
              {currentIndex + 1} / {productImages.length}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="size-9 rounded-full bg-white/10 text-white transition-transform hover:scale-105 hover:bg-white/25 active:scale-95"
              aria-label="Close fullscreen gallery"
            >
              <XIcon className="size-5" />
            </Button>
          </div>

          {/* الصورة المكبرة مع أزرار التنقل */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex max-h-[75vh] w-full max-w-5xl flex-1 items-center justify-center p-2"
          >
            {productImages.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handlePrev}
                className="absolute start-2 z-10 size-11 rounded-full bg-white/15 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-white/30 active:scale-95 sm:start-4"
                aria-label="Previous image"
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
                  className="max-h-[72vh] max-w-full rounded-xl object-contain shadow-2xl transition-all duration-300"
                />
              ) : (
                <div className="flex size-64 flex-col items-center justify-center text-white/70">
                  <ImageIcon className="size-16 stroke-[1.5]" />
                  <span className="mt-2 text-sm">Image unavailable</span>
                </div>
              )}
            </div>

            {productImages.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleNext}
                className="absolute end-2 z-10 size-11 rounded-full bg-white/15 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-white/30 active:scale-95 sm:end-4"
                aria-label="Next image"
              >
                <ChevronRightIcon className="size-6 rtl:rotate-180" />
              </Button>
            )}
          </div>

          {/* شريط المصغرات السفلي داخل النافذة المنبثقة */}
          {productImages.length > 1 && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex max-w-full [scrollbar-width:none] items-center gap-2 overflow-x-auto scroll-smooth rounded-2xl bg-white/10 p-2 backdrop-blur-md [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {productImages.map((img) => {
                const isSelected = activeImage === img.url
                const isFailed = Boolean(failedImages[img.url])

                return (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => onThumbnailClick(img)}
                    className={`relative size-14 shrink-0 cursor-pointer overflow-hidden rounded-xl border transition-all duration-200 ${
                      isSelected
                        ? "scale-105 border-primary shadow-md ring-2 ring-primary/50"
                        : "border-white/20 opacity-40 hover:scale-95 hover:opacity-100"
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
                      <div className="flex size-full items-center justify-center bg-white/10 text-white/60">
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
