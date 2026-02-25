"use client";

import { useState, useTransition } from "react";
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
import { Heart, ShoppingCart, Star, Trash } from "lucide-react";
import { ProcessedProduct, removeFromWishlist } from "@/lib/actions/wishlist"; // تأكد من أن هذا النوع صحيح
import { useRouter } from "next/navigation";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { AspectRatio } from "../ui/aspect-ratio";
import { Badge } from "../ui/badge";
import { Spinner } from "../ui/spinner";
import { toast } from "sonner";
import { addItemToCart } from "@/lib/actions/cart";
import { useCartCount } from "@/lib/provider/cart-provider";

interface WishlistPageProps {
  wishlistItems: ProcessedProduct[];
}

function AddToCartButton({ product }: { product: ProcessedProduct }) {
  const { refreshCount } = useCartCount();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock_quantity <= 0) {
      toast.error("Sorry, this product is out of stock.");
      return;
    }
    setIsAdding(true);
    const { error } = await addItemToCart({
      variantId: product.variant_id,
      quantity: 1,
    });
    if (error) {
      toast.error("Failed to add to cart: " + error);
    } else {
      toast.success(`${product.name} added to cart successfully!`);
      refreshCount();
    }
    setIsAdding(false);
  };

  return (
    <Button
      size="icon-sm"
      className="cursor-pointer"
      onClick={handleAddToCart}
      disabled={isAdding}
    >
      {isAdding ? <Spinner /> : <ShoppingCart />}
    </Button>
  );
}

function ProductCard({
  product,
  basePath = "/products",
  onRemove,
}: {
  product: ProcessedProduct;
  basePath?: string;
  onRemove: (productId: string) => void;
}) {
  const [isRemoving, startRemoveTransition] = useTransition();

  const router = useRouter(); // ✅ استخدام الروتر داخلياً

  const handleView = () => {
    router.push(`${basePath}/${product.slug}`);
  };


    const handleRemove = () => {
      startRemoveTransition(async () => {
        const {error} = await removeFromWishlist(product.id!);
        if (error) {
          toast.error("Failed to remove item from wishlist.");
          return;
        }
        onRemove(product.id!);
      });
    };



  return (
    <Card
      onClick={handleView}
      key={product.slug}
      className=" h-full overflow-hidden  p-1  transition-all duration-300 hover:shadow-lg hover:-translate-y-1 gap-3"
    >
      <AspectRatio
        key={product.id}
        ratio={1 / 1}
        className="relative bg-muted overflow-hidden rounded-lg"
      >
        {product.discountPercentage && (
          <Badge variant="default" className="absolute top-2 left-2 z-10">
            Discount {`${product.discountPercentage}%`}
          </Badge>
        )}

        <div className="absolute top-2 right-2 z-10">
          <Button
            size="icon-sm"
            onClick={handleRemove}
            disabled={isRemoving}
            className="bg-red-500 hover:bg-red-600 text-white "
          >
            {isRemoving ? <Spinner /> : <Trash />}
          </Button>
        </div>

        <img
          src={product.main_image_url || "/placeholder.svg"}
          alt="Photo"
          className=" object-cover object-center  h-full w-full"
        />
      </AspectRatio>
      <CardHeader className="px-2 pt-2">
        <CardTitle className="text-lg font-bold">{product.name}</CardTitle>
        {product.total_reviews > 0 && (
          <CardAction>
            <Badge variant="secondary">
              <div className="flex items-center gap-1 text-sm text-yellow-500">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-muted-foreground">
                  {product.average_rating}
                </span>
              </div>
            </Badge>
          </CardAction>
        )}
      </CardHeader>
      <CardDescription className="px-2 grow">
        {product.short_description}
      </CardDescription>
      <CardFooter className="flex justify-between items-center px-2 pb-2 ">
        <div className="space-x-2">
          {product.discount_price ? (
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-primary">
                ${product.discount_price}
              </span>
              <span className="text-sm text-muted-foreground line-through">
                ${product.price}
              </span>
            </div>
          ) : (
            <span className="font-bold">${product.price}</span>
          )}
        </div>
        <AddToCartButton product={product} />
      </CardFooter>
    </Card>
  );
}

export function WishlistPage({ wishlistItems }: WishlistPageProps) {
  const [items, setItems] = useState(wishlistItems);

  // دالة لإزالة عنصر من الحالة المحلية بعد حذفه بنجاح من الخادم
  const handleItemRemoved = (productId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  // ✅ التحسين: عرض حالة "فارغة" فقط إذا كانت القائمة فارغة حقًا
  if (items.length === 0) {
    return (
      <Empty className="h-[60vh]">
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
            <ProductCard key={item.id} product={item} onRemove={handleItemRemoved} />
          ))}
        </div>
      </AnimatePresence>
    </main>
  );
}
