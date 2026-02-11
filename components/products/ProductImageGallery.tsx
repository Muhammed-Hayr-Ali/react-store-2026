// components/products/ProductImageGallery.tsx

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { type FullProduct } from "@/types";
import { cn } from "@/lib/utils";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
// ✅ الخطوة 1: استيراد المكونات اللازمة من framer-motion
import { motion, AnimatePresence } from "framer-motion";

interface ProductImageGalleryProps {
  product: FullProduct;
  activeImageUrl: string | null;
  setActiveImageUrl: React.Dispatch<React.SetStateAction<string | null>>;
}

export function ProductImageGallery({ product }: ProductImageGalleryProps) {
  const allImages = [
    product.main_image_url,
    ...(product.image_urls || []),
    ...product.variants.map((v) => v.image_url).filter(Boolean),
  ].filter(Boolean) as string[];

  const [activeImage, setActiveImage] = useState(
    allImages[0] || "/placeholder.svg",
  );

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const openLightbox = () => {
    if (allImages.length > 0) {
      setIsLightboxOpen(true);
    }
  };

  const closeLightbox = () => setIsLightboxOpen(false);

  const goToNextImage = () => {
    const currentIndex = allImages.indexOf(activeImage);
    const nextIndex = (currentIndex + 1) % allImages.length;
    setActiveImage(allImages[nextIndex]);
  };

  const goToPreviousImage = () => {
    const currentIndex = allImages.indexOf(activeImage);
    const prevIndex = (currentIndex - 1 + allImages.length) % allImages.length;
    setActiveImage(allImages[prevIndex]);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      if (e.key === "ArrowRight") goToNextImage();
      if (e.key === "ArrowLeft") goToPreviousImage();
      if (e.key === "Escape") closeLightbox();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, activeImage]);

  return (
    <>
      <div className="flex flex-col-reverse md:flex-row gap-10">
        <div className="flex md:flex-col gap-3 pb-2 md:pb-0">
          {allImages.map((img, index) => (
            <button
              key={index}
              onClick={() => setActiveImage(img)}
              className={cn(
                "relative shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-colors",
                activeImage === img
                  ? "border-primary"
                  : "border-transparent hover:border-muted-foreground/50",
              )}
            >
              <Image
                src={img}
                alt={`${product.name} thumbnail ${index + 1}`}
                fill
                className="object-contain"
              />
            </button>
          ))}
        </div>

        <div
          className="relative grow w-full h-80 md:h-auto aspect-square rounded-lg border bg-card overflow-hidden cursor-pointer"
          onClick={openLightbox}
        >
          <Image
            src={activeImage}
            alt={product.name}
            fill
            className="object-contain p-4 transition-transform duration-500 hover:scale-105"
          />
        </div>
      </div>

      {/* ✅ الخطوة 2: استخدام AnimatePresence للتحكم في ظهور واختفاء المكون */}
      <AnimatePresence>
        {isLightboxOpen && (
          // ✅ الخطوة 3: إضافة motion.div وتحديد الحركات
          <motion.div
            initial={{ opacity: 0 }} // الحالة الأولية (شفاف)
            animate={{ opacity: 1 }} // حالة الظهور (ظاهر بالكامل)
            exit={{ opacity: 0 }} // حالة الاختفاء (شفاف)
            transition={{ duration: 0.3, ease: "easeInOut" }} // مدة وسلاسة الحركة
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
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

            {/* ✅ الخطوة 4: إضافة حركة لحاوية الصورة نفسها (تأثير تكبير) */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }} // تبدأ صغيرة وشفافة
              animate={{ scale: 1, opacity: 1 }} // تنمو إلى حجمها الكامل وتظهر
              exit={{ scale: 0.8, opacity: 0 }} // تتقلص وتختفي
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="relative w-full h-full max-w-4xl max-h-[85vh] bg-white rounded-lg shadow-2xl p-2"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={activeImage}
                alt={product.name}
                fill
                className="object-contain"
              />
            </motion.div>

            <button
              className="absolute right-4 md:right-8 text-white/70 hover:text-white transition-colors p-2 z-10"
              onClick={(e) => {
                e.stopPropagation();
                goToNextImage();
              }}
            >
              <ChevronRight size={48} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
