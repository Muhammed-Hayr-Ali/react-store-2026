// src/components/products/FeaturedProductCard.tsx (مسار مقترح)
"use client";

import { useRouter } from "next/navigation";
import { Card } from "../ui/card";
import { AspectRatio } from "../ui/aspect-ratio";

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
    <Card
      onClick={handleView}
      key={product.slug}
      className=" h-full overflow-hidden  p-1  transition-all duration-300 hover:shadow-lg hover:-translate-y-1 gap-2 cursor-pointer rounded-3xl"
    >
      <AspectRatio
        key={product.slug}
        ratio={4 / 3}
        className="relative bg-muted overflow-hidden rounded-2xl"
      >
 

        <div className="h-2/5 w-full p-3 absolute bottom-0 left-0 bg-linear-to-t from-black/90  to-black/0 flex items-end">
          <div className="w-full flex justify-between items-center gap-2">
            <div className=" flex flex-col text-white">
              <h1 className="text-lg font-semibold">{product.name}</h1>
              <p className="text-xs">{product.short_description}</p>
              <span className="text-sm pt-2">
              
              </span>
            </div>
          </div>
        </div>

        <img
          src={product.main_image_url || "/placeholder.svg"}
          alt="Photo"
          className=" object-cover object-center h-full w-full"
        />
      </AspectRatio>
  
    </Card>
  );
}
