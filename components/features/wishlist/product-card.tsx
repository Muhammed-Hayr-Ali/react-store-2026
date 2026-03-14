"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useFormatPrice } from "@/hooks/use-format-price";
import { addItemToCart } from "@/lib/actions/cart";
import { MiniProduct } from "@/lib/actions/wishlist";
import { useCartCount } from "@/lib/provider/cart-provider";
import { useLocale } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import {  ShoppingCart } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

interface ProductCardProps {
  product: MiniProduct;
  className?: string;
}

function AddToCartButton({ product }: { product: MiniProduct }) {
  const { refreshCount } = useCartCount();
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToCart = async () => {
    if (product.stock_quantity <= 0) {
      toast.error("عذراً، هذا المنتج نفذ من المخزون.");
      return;
    }

    setIsLoading(true);

    const { error } = await addItemToCart({
      variantId: product.variant_id,
      quantity: 1,
    });

    if (error) {
      toast.error("فشل الإضافة للسلة: " + error);
    } else {
      toast.success(`تم إضافة ${product.name} للسلة بنجاح!`);
      refreshCount();
    }

    setIsLoading(false);
  };

  return (
    <Button
      disabled={isLoading || product.stock_quantity <= 0}
      onClick={handleAddToCart}
      size="icon"
      className="rounded-full shrink-0"
    >
      { isLoading ? <Spinner /> : <ShoppingCart className="size-4" />}
    </Button>
  );
}

const ProductCard: React.FC<ProductCardProps> = ({ product, className }) => {
  const locale = useLocale();
  const price = useFormatPrice(product.price, locale);
  const discountPrice = useFormatPrice(product.discount_price, locale);

  const hasDiscount =
    product.discountPercentage && product.discountPercentage > 0;
  const isOutOfStock = product.stock_quantity <= 0;
  const rating = product.average_rating || 0;
  const isFeatured = product.is_featured;

  return (
    <Card className="relative mx-auto w-full max-w-sm pt-0 gap-1.5">
      <div className="absolute inset-0 z-30 aspect-video bg-black/35" />
      <img
        src="https://avatar.vercel.sh/shadcn1"
        alt="Event cover"
        className="relative z-20 aspect-video w-full object-cover brightness-60 grayscale dark:brightness-40"
      />
      <CardHeader className="p-4">
        <CardAction>
          <Badge variant="secondary">Featured</Badge>
        </CardAction>
        <CardTitle>Design systems meetup</CardTitle>
        <CardDescription>
          A practical talk on component APIs, accessibility, and shipping
          faster.
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Button className="w-full">View Event</Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
