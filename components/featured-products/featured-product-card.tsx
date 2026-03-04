// src/components/products/FeaturedProductCard.tsx (مسار مقترح)
import { AspectRatio } from "../ui/aspect-ratio";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { MiniProduct } from "@/lib/actions/get-all-mini-products";

// نوع البيانات للمنتج الواحد، تأكد من أنه يطابق البيانات القادمة

interface ProductCardProps {
  product: MiniProduct;
  basePath: string;

  className?: string; // للسماح بتمرير فئات CSS إضافية
}

export function FeaturedProductCard({ product,basePath, className }: ProductCardProps) {

  return (
    <Link href={`${basePath}/${product.slug}`}>
      <AspectRatio
        ratio={2.35 / 1}
        className={cn("overflow-hidden rounded-md", className)}
      >
        <Image
          src={product.main_image_url || "/placeholder.svg"}
          fill
          alt="Image"
          className="object-cover"
        />
      </AspectRatio>
    </Link>
  );
}
