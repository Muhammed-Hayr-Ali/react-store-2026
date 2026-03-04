"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

import { Badge } from "../ui/badge";
import { AspectRatio } from "../ui/aspect-ratio";
import { Spinner } from "../ui/spinner";
import { useCartCount } from "@/lib/provider/cart-provider";
import { addItemToCart } from "@/lib/actions/cart";
import { MiniProduct } from "@/lib/actions/get-all-mini-products";
import { Card } from "../ui/card";
import { useLocale } from "next-intl";
import { useFormatPrice } from "@/hooks/use-format-price";

function AddToCartButton({ product }: { product: MiniProduct }) {
  const router = useRouter();
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
      if (error === "AUTHENTICATION_FAILED") {
        router.push("/auth/login");
      } else {
        toast.error("Failed to add to cart: " + error);
      }
    } else {
      toast.success(`${product.name} added to cart successfully!`);
      refreshCount();
    }
    setIsAdding(false);
  };

  return (
    <Button
      size="icon-sm"
      variant={"outline"}
      className="cursor-pointer rounded-full"
      onClick={handleAddToCart}
      disabled={isAdding}
    >
      {isAdding ? <Spinner /> : <ShoppingCart />}
    </Button>
  );
}

export function ProductCard({
  product,
  basePath,
}: {
  product: MiniProduct;
  basePath?: string;
}) {
  const locale = useLocale();
  const router = useRouter(); // ✅ استخدام الروتر داخلياً

  const displayPrice = useFormatPrice(product.price, locale);
  const displayoriginalPrice = useFormatPrice(
    product.discount_price ?? product.price,
    locale,
  );

  const handleView = () => {
    router.push(`${basePath}/${product.slug}`);
  };

  return (
    <Card
      onClick={handleView}
      key={product.slug}
      className=" h-full overflow-hidden  p-1  transition-all duration-300 hover:shadow-lg hover:-translate-y-1 gap-2 cursor-pointer rounded-3xl"
    >
      <AspectRatio
        key={product.name}
        ratio={4 / 3}
        className="relative bg-muted overflow-hidden rounded-2xl"
      >
        {product.discountPercentage && (
          <Badge className="absolute top-2 left-2 z-10">
            Discount {`${product.discountPercentage}%`}
          </Badge>
        )}

        <div className="h-2/5 w-full p-3 absolute bottom-0 left-0 bg-linear-to-t from-black/90  to-black/0 flex items-end">
          <div className="w-full flex justify-between items-center gap-2">
            <div className=" flex flex-col text-white">
              <h1 className="text-lg font-semibold">{product.name}</h1>
              <p className="text-xs">{product.short_description}</p>
              <span className="text-sm pt-2">
                {product.discount_price ? (
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold">
                      {displayoriginalPrice}
                    </span>
                    <span className="text-sm text-muted-foreground line-through">
                      {displayPrice}
                    </span>
                  </div>
                ) : (
                  <span className="font-bold">{displayPrice}</span>
                )}
              </span>
            </div>
            <AddToCartButton product={product} />
          </div>
        </div>

        <img
          src={product.main_image_url || "/placeholder.svg"}
          alt="Photo"
          className=" object-cover object-center h-full w-full"
        />
      </AspectRatio>
      {/* <CardHeader className="px-2">
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
      </CardFooter> */}
    </Card>
  );
}
