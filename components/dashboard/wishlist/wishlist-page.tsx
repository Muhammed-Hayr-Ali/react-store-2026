"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion"; // لإضافة تأثيرات حركية جميلة

// --- استيرادات الواجهة والأيقونات ---
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { HeartCrack, ShoppingBag } from "lucide-react";

// --- استيرادات الأنواع و Server Actions ---
import { type WishlistItemWithProduct } from "@/types";
import { removeFromWishlist } from "@/lib/actions/wishlist";

// =================================================================
// مكون فرعي لبطاقة المنتج في قائمة الرغبات
// =================================================================
interface WishlistItemCardProps {
  item: WishlistItemWithProduct;
  onRemove: (productId: string) => void; // دالة لإبلاغ المكون الأب بالحذف
}

function WishlistItemCard({ item, onRemove }: WishlistItemCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const product = item.products;

  if (!product) return null; // لا تعرض أي شيء إذا كان المنتج غير موجود

  const handleRemove = async () => {
    setIsDeleting(true);
    const result = await removeFromWishlist(product.id!);
    if (result.success) {
      toast.success(result.message);
      onRemove(product.id!); // ✅ --- التصحيح: استدعاء onRemove عند النجاح ---
    } else {
      toast.error(result.error);
      setIsDeleting(false);
    }
  };



  return (
    <motion.div
      layout // هذا السحر يجعل العناصر الأخرى تتحرك بسلاسة عند حذف عنصر
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
      className="border rounded-lg overflow-hidden flex flex-col"
    >
      <Link href={`/products/${product.slug}`} className="block group">
        <div className="aspect-square bg-muted overflow-hidden">
          <img
            src={product.main_image_url || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-semibold text-lg truncate">
          <Link href={`/products/${product.slug}`}>{product.name}</Link>
        </h3>
        <div className="mt-2">
          {product.discount_price ? (
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-primary">
                ${product.discount_price.toFixed(2)}
              </span>
              <span className="text-sm text-muted-foreground line-through">
                ${product.price?.toFixed(2)}
              </span>
            </div>
          ) : (
            <span className="text-xl font-bold">
              ${product.price?.toFixed(2)}
            </span>
          )}
        </div>
        <div className="mt-auto pt-4">
          <Button
            onClick={handleRemove}
            variant="destructive"
            className="w-full"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Spinner/>
            ) : (
              <HeartCrack className="mr-2 h-4 w-4" />
            )}
            Remove
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// =================================================================
// المكون الرئيسي للصفحة
// =================================================================
interface WishlistPageProps {
  initialItems: WishlistItemWithProduct[];
}

export function WishlistPage({ initialItems }: WishlistPageProps) {
  const [items, setItems] = useState(initialItems);

  const handleItemRemoved = (productId: string) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.product_id !== productId),
    );
  };



  



    if (items.length === 0)
      return (
        <div className="flex flex-1 h-full items-center justify-center rounded-lg border border-dashed">
          <div className="flex flex-col items-center gap-2 text-center">
            <h2 className="text-xl font-semibold">Your Wishlist is Empty</h2>
            <p className="text-muted-foreground mt-2">
              Looks like you haven&#39;t added anything yet.
            </p>
            <Link
              href="/"
              className="mt-4 inline-block bg-primary text-primary-foreground px-6 py-2 rounded-md"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      );



  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
      <AnimatePresence>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <WishlistItemCard
              key={item.id}
              item={item}
              onRemove={handleItemRemoved}
            />
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
}
