"use client";

import { FullProduct, ProductVariant } from "@/lib/types";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Spinner } from "../ui/spinner";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export function ImageGallery({
  product,
  activeVariant, // ✅ استقبال المتغير النشط
}: {
  product: FullProduct;
  activeVariant: ProductVariant | undefined;
}) {
  const imageList = [
    product.main_image_url,
    ...(product.image_urls || []),
    ...product.variants.map((v) => v.image_url).filter(Boolean),
  ].filter(Boolean) as string[];

  const [activeImage, setActiveImage] = useState(
    imageList[0] || "/placeholder.svg",
  );
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // ✅ تعيين الصورة النشطة عند تحميل القائمة

  const openLightbox = () => {
    if (imageList.length > 0) {
      setIsLightboxOpen(true);
    }
  };

  const closeLightbox = () => setIsLightboxOpen(false);

  const goToPreviousImage = useCallback(() => {
    const currentIndex = imageList.indexOf(activeImage);
    const prevIndex = (currentIndex - 1 + imageList.length) % imageList.length;
    setActiveImage(imageList[prevIndex]);
  }, [imageList, activeImage]);

  const goToNextImage = useCallback(() => {
    const currentIndex = imageList.indexOf(activeImage);
    const nextIndex = (currentIndex + 1) % imageList.length;
    setActiveImage(imageList[nextIndex]);
  }, [imageList, activeImage]);

  // معالجة لوحة المفاتيح
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      if (e.key === "ArrowRight") goToNextImage();
      if (e.key === "ArrowLeft") goToPreviousImage();
      if (e.key === "Escape") closeLightbox();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isLightboxOpen,
    activeImage,
    imageList,
    goToNextImage,
    goToPreviousImage,
  ]);

  useEffect(() => {
    function handleImageLoad() {
      const variantImage = activeVariant?.image_url?.trim();

      if (variantImage) {
        setActiveImage(variantImage);
      }
    }

    handleImageLoad();
  }, [activeVariant]);

  // ✅ إذا لم توجد صور، عرض عنصر نائب
  if (imageList.length === 0) {
    return (
      <div className="relative w-full h-64 md:h-96 lg:h-auto aspect-square rounded-lg border bg-muted flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <svg
            className="w-16 h-16 mx-auto mb-2 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p>No images available</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col-reverse md:flex-row gap-4">
        {/* الصور المصغرة */}
        {imageList.length > 1 && (
          <div className="flex md:flex-col gap-2 pb-2 md:pb-0 justify-center md:justify-start overflow-x-auto md:overflow-visible">
            {imageList.map((img, index) => (
              <button
                key={index}
                onClick={() => setActiveImage(img)}
                className={cn(
                  "relative shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-md overflow-hidden border-2 transition-all",
                  activeImage === img
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-muted hover:border-primary/50",
                )}
              >
                <img
                  src={img}
                  alt={`${product.name} thumbnail ${index + 1}`}
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* الصورة الرئيسية */}
        <div
          className="relative grow w-full max-h-125 h-auto aspect-square rounded-lg border bg-card overflow-hidden cursor-zoom-in"
          onClick={openLightbox}
        >
          {/* {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <Spinner />
            </div>
          )} */}
          <img
            src={activeImage}
            alt={product.name}
            className={cn(
              "object-cover transition-transform duration-300 hover:scale-105  h-full w-full",
              // imageLoaded ? "opacity-100" : "opacity-0",
            )}
            // onLoadingComplete={() => setImageLoaded(true)}
            onError={() => {
              console.error("❌ Image failed to load:", activeImage);
              setImageLoaded(true);
            }}
            // unoptimized={activeImage.startsWith("http")}
          />

          {imageList.length > 1 && (
            <>
              <button
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  goToPreviousImage();
                }}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  goToNextImage();
                }}
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Lightbox - عرض الصورة المكبرة */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={closeLightbox}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-10"
            onClick={closeLightbox}
          >
            <X size={32} />
          </button>

          <button
            className="absolute left-4 md:left-8 text-white/70 hover:text-white transition-colors p-2 z-10"
            onClick={(e) => {
              e.stopPropagation();
              goToPreviousImage();
            }}
          >
            <ChevronLeft size={48} />
          </button>

          <div
            className="relative w-full h-full max-w-5xl max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activeImage}
              alt={product.name}
              className="object-contain h-full w-full object-center"
            />
          </div>

          <button
            className="absolute right-4 md:right-8 text-white/70 hover:text-white transition-colors p-2 z-10"
            onClick={(e) => {
              e.stopPropagation();
              goToNextImage();
            }}
          >
            <ChevronRight size={48} />
          </button>
        </div>
      )}
    </>
  );
}
