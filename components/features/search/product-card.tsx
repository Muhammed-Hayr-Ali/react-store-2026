"use client";

import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Percent, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { isFuture, differenceInDays, isToday } from "date-fns";
import { Product, Variant } from "@/lib/actions/search"; // تأكد من صحة المسار

interface ProductCardProps {
  product: Product;
  className?: string;
}

// --- دالة الوقت المتبقي (لم تتغير) ---
function getExpiryMessage(
  expiryDate: string | Date | null | undefined,
): string | null {
  if (!expiryDate) return null;
  const endDate = new Date(expiryDate);
  if (isNaN(endDate.getTime())) return null;
  if (isFuture(endDate)) {
    const daysLeft = differenceInDays(endDate, new Date());
    if (daysLeft === 0 || isToday(endDate)) return "Expires today!";
    if (daysLeft === 1) return "Expires in 1 day";
    return `Expires in ${daysLeft} days`;
  }
  return null;
}

// --- شارة الخصم (لم تتغير) ---
const DiscountBadge = ({ variant }: { variant: Variant }) => {
  const isDiscountActive =
    variant.discount_price != null &&
    variant.discount_expires_at &&
    isFuture(new Date(variant.discount_expires_at));

  if (!isDiscountActive) return null;

  const discountPercentage = Math.round(
    ((variant.price - variant.discount_price!) / variant.price) * 100,
  );

  return (
    <div className="absolute top-4 left-4 z-10 bg-background/80 text-foreground backdrop-blur-sm text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
      <Percent className="h-3.5 w-3.5 text-primary" />
      <span>{discountPercentage}% OFF</span>
    </div>
  );
};

export function ProductCard({ product, className }: ProductCardProps) {
  const displayVariant = product.variants?.[0];

  const handleBuyNow = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log(`Redirecting to checkout for ${product.name}!`);
  };

  const isDiscountActive =
    displayVariant?.discount_price != null &&
    displayVariant?.discount_expires_at &&
    isFuture(new Date(displayVariant.discount_expires_at));

  const expiryMessage = isDiscountActive
    ? getExpiryMessage(displayVariant.discount_expires_at)
    : null;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group outline-none h-96 block"
    >
      <Card
        className={cn(
          "h-full w-full overflow-hidden rounded-2xl relative border-none",
          className,
        )}
      >
        <img
          src={product.main_image_url || "/placeholder.svg"}
          alt={product.name}
          className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105  h-full w-full"
        />

        {displayVariant && <DiscountBadge variant={displayVariant} />}

        <div className="absolute inset-x-0 bottom-0 h-3/4 bg-linear-to-t from-black/80 via-black/30 to-transparent" />

        <div className="absolute inset-0 flex flex-col justify-end p-5 text-white">
          <h3 className="font-bold text-2xl leading-tight tracking-tight">
            {product.name}
          </h3>

          <p className="text-white/80 mt-1 text-sm">
            A premium choice for style and comfort.
          </p>

          {expiryMessage && (
            <div className="flex items-center gap-1.5 text-xs text-amber-300 mt-3 font-semibold">
              <Clock className="h-3.5 w-3.5" />
              <span>{expiryMessage}</span>
            </div>
          )}

          <div className="flex justify-between items-center mt-4">
            {/* ✅ 2. قسم السعر المصحح */}
            {displayVariant ? (
              <div className="flex flex-col">
                <p className="text-2xl font-extrabold tracking-tight">
                  {/* استخدام متغير isDiscountActive مباشرة */}
                  {isDiscountActive
                    ? `$${displayVariant.discount_price!.toFixed(2)}`
                    : `$${displayVariant.price.toFixed(2)}`}
                </p>
                {/* عرض السعر المشطوب فقط إذا كان الخصم نشطًا */}
                {isDiscountActive && (
                  <p className="text-base text-white/60 line-through -mt-1">
                    ${displayVariant.price.toFixed(2)}
                  </p>
                )}
              </div>
            ) : (
              // حالة عدم وجود متغيرات
              <p className="text-lg font-semibold">N/A</p>
            )}

            <Button
              className="bg-white text-black rounded-full h-12 px-6 font-bold text-base group/button hover:bg-gray-200"
              onClick={handleBuyNow}
            >
              Buy Now
              <ArrowRight className="h-4 w-4 ml-2 transition-transform duration-300 group-hover/button:translate-x-1" />
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  );
}
