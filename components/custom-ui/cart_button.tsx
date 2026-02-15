"use client";

import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";

export const CartButton = ({
  count,
  isloading,
}: {
  count?: number;
  isloading?: boolean;
}) => {
  const displayCount = count ?? 0;

  return (
    <Button
      variant={"ghost"}
      className="relative flex h-8 w-fit items-center justify-between rounded-sm px-2 py-2 hover:bg-[#EBEBEB] dark:hover:bg-[#1F1F1F]"
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
