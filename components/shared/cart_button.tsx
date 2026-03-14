"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";

export const CartButton = ({
  count,
  isloading,
  className,
}: {
  count?: number;
  isloading?: boolean;
  className?: string;
}) => {
  const displayCount = count ?? 0;

  return (
    <Button
      variant={"ghost"}
      size={"icon-sm"}
      className={cn("relative", className)}
      asChild
    >
      <Link href="/cart">
        <ShoppingCart size={16} className="rtl:rotate-y-180" />

        {/* عرض الدائرة فقط إذا كان هناك تحميل أو العدد أكبر من صفر */}
        {(isloading || displayCount > 0) && (
          <div
            // ✅ الخطوة الحاسمة: استخدام `key` لإعادة تشغيل الرسوم المتحركة
            key={displayCount}
            className={`
            absolute -right-0.5 -top-0.5 min-h-4 min-w-4 flex items-center justify-center z-50
            rounded-full
            bg-foreground text-[10px] text-background
            text-center
            rtl:right-auto rtl:-left-0.5

          `}
          >
            {isloading ? (
              <div className="h-0.5 w-0.5 animate-ping rounded-full bg-background" />
            ) : (
              displayCount
            )}
          </div>
        )}
      </Link>
    </Button>
  );
};
