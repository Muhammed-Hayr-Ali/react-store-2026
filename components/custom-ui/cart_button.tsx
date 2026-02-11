"use client";

import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

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
    >
      <ShoppingCart size={16} className="rtl:rotate-y-180" />

      {/* عرض الدائرة فقط إذا كان هناك تحميل أو العدد أكبر من صفر */}
      {(isloading || displayCount > 0) && (
        <div
          // ✅ الخطوة الحاسمة: استخدام `key` لإعادة تشغيل الرسوم المتحركة
          key={displayCount}
          className={`
            absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center 
            justify-center rounded-full bg-foreground text-[10px] 
            text-background  rtl:right-auto rtl:-left-0.5
            ${!isloading ? "animate-cart-bounce" : ""}
          `}
        >
          {isloading ? (
            <div className="h-2 w-2 animate-pulse rounded-full bg-background" />
          ) : (
            displayCount
          )}
        </div>
      )}
    </Button>
  );
};
