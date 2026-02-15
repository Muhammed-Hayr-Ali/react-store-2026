"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence } from "framer-motion"; // لإضافة تأثيرات حركية جميلة
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { WishlistItem } from "@/lib/actions/wishlist"; // تأكد من أن هذا النوع صحيح
import WishlistItemCard from "./WishlistItemCard";

interface WishlistPageProps {
  initialItems: WishlistItem[];
}

export function WishlistPage({ initialItems }: WishlistPageProps) {
  const [items, setItems] = useState(initialItems);

  // دالة لإزالة عنصر من الحالة المحلية بعد حذفه بنجاح من الخادم
  const handleItemRemoved = (productId: string) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.product_id !== productId),
    );
  };

  // ✅ التحسين: عرض حالة "فارغة" فقط إذا كانت القائمة فارغة حقًا
  if (items.length === 0) {
    return (
      <Empty className="h-full">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Heart className="rtl:rotate-y-180" />
          </EmptyMedia>
          <EmptyTitle>Your Wishlist is empty</EmptyTitle>
          <EmptyDescription className="max-w-xs text-pretty">
            Looks like you have no items in your wishlist.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild>
            <Link
              href="/"
              className="flex gap-2 items-center rtl:flex-row-reverse"
            >
              <p>Continue Shopping</p>
            </Link>
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <main className="container mx-auto min-h-[50vh] px-4 mb-8">
      <h1 className="text-3xl font-bold">Wishlist ({items.length})</h1>
      {/* ✅ التحسين: استخدام AnimatePresence لتغليف الشبكة للسماح بتأثير الخروج */}
      <AnimatePresence>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 py-6">
          {items.map((item) => (
            <WishlistItemCard
              key={item.id}
              item={item}
              onRemove={handleItemRemoved}
            />
          ))}
        </div>
      </AnimatePresence>
    </main>
  );
}
