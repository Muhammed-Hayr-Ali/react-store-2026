"use client";

import { AnimatePresence } from "framer-motion"; // لإضافة تأثيرات حركية جميلة
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { CircleX, Heart } from "lucide-react";
import { MiniProduct } from "@/lib/actions/wishlist"; // تأكد من أن هذا النوع صحيح
import ProductCard from "./product-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface WishlistPageProps {
  wishlistItems: MiniProduct[] | undefined;
  error?: string;
}





export function WishlistPage({ wishlistItems, error }: WishlistPageProps) {
  if (error) {
    <Empty className="min-h-[60vh]">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CircleX />
        </EmptyMedia>
        <EmptyTitle>Something went wrong</EmptyTitle>
        <EmptyDescription>{error}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild>
          <Link href="/">Go Back</Link>
        </Button>
      </EmptyContent>
    </Empty>;
  }

  if (wishlistItems === undefined || wishlistItems.length === 0) {
    return (
      <Empty className="min-h-[60vh]">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Heart />
          </EmptyMedia>
          <EmptyTitle>Your Wishlist is empty</EmptyTitle>
          <EmptyDescription>
            Looks like you have no items in your wishlist.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild>
            <Link href="/">Start Shopping</Link>
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <main className="container mx-auto min-h-[50vh] px-4 mb-8">
      <h1 className="text-3xl font-bold">Wishlist ({wishlistItems.length})</h1>
      {/* ✅ التحسين: استخدام AnimatePresence لتغليف الشبكة للسماح بتأثير الخروج */}
      <AnimatePresence>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 py-6">
          {wishlistItems.map((item) => (
            <ProductCard key={item.slug} product={item} />
          ))}
        </div>
      </AnimatePresence>
    </main>
  );
}
