"use client";
import Image from "next/image";
import Link from "next/link";
import { type ProductWithVariant } from "@/lib/actions/products";
import { Zap } from "lucide-react";
import { useLocale } from "next-intl";

interface OfferProductCardProps {
  product: ProductWithVariant;
}

export function OfferProductCard({ product }: OfferProductCardProps) {
  const locale = useLocale();
  if (!product.discount_price) {
    return null;
  }

  const discountPercentage = Math.round(
    ((product.price - product.discount_price) / product.price) * 100,
  );
  // app\[locale]\(store)\products\[slug]\page.tsx
  return (
    <Link
      href={`/${locale}/products/${product.slug}`}
      className="group relative flex flex-col h-full bg-background/50 rounded-lg overflow-hidden p-4 border border-transparent hover:border-primary/50 transition-all duration-300"
    >
      {/* الصورة */}
      <div className="relative shrink-0 w-full h-40 mb-4">
        <img
          src={product.main_image_url || "/placeholder.svg"}
          alt={product.name}
          className="object-contain drop-shadow-lg group-hover:scale-105 transition-transform duration-300"
        />
        {/* شارة الخصم */}
        <div className="absolute top-0 right-0 rtl:right-auto rtl:left-0 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-bl-md rtl:rounded-bl-none rtl:rounded-br-md flex items-center gap-1">
          <Zap size={12} />
          <span>{discountPercentage}%</span>
        </div>
      </div>

      {/* المحتوى النصي */}
      <div className="flex flex-col grow">
        <h4
          className="font-semibold text-md grow line-clamp-2"
          title={product.name}
        >
          {product.name}
        </h4>
        <div className="mt-2 flex items-baseline gap-2">
          <p className="text-xl font-bold text-foreground">
            ${product.discount_price.toFixed(2)}
          </p>
          <p className="text-sm text-muted-foreground line-through">
            ${product.price.toFixed(2)}
          </p>
        </div>
      </div>
    </Link>
  );
}
