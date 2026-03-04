// src/components/products/FeaturedProductCard.tsx (مسار مقترح)
"use client";

import { useRouter } from "next/navigation";
import { Card } from "../ui/card";
import { AspectRatio } from "../ui/aspect-ratio";
import Image from "next/image";

// نوع البيانات للمنتج الواحد، تأكد من أنه يطابق البيانات القادمة
export type FeaturedProduct = {
  name: string;
  slug: string;
  short_description: string;
  main_image_url: string;
  tags?: string[];
};

interface ProductCardProps {
  product: FeaturedProduct;
  className?: string; // للسماح بتمرير فئات CSS إضافية
}

export function FeaturedProductCard({ product, className }: ProductCardProps) {

  

const   basePath = "/products";

  const router = useRouter(); // ✅ استخدام الروتر داخلياً

  const handleView = () => {
    router.push(`${basePath}/${product.slug}`);
  };

  return (
    <AspectRatio ratio={2.35 / 1} className="overflow-hidden rounded-md">
      <Image
        src={product.main_image_url}
        fill
        alt="Image"
        className="object-cover"
      />
    </AspectRatio>
  );
}
