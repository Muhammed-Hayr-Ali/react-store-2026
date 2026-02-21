"use client";


import { useCartCount } from "@/lib/provider/cart-provider";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Spinner } from "../ui/spinner";
import { Button } from "../ui/button";
import { addItemToCart } from "@/lib/actions/cart";

export default function AddToCartButton({
  variantId,
  quantity,
}: {
  variantId: string;
  quantity: number;
}) {
  const { refreshCount } = useCartCount();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleAddToCart = async () => {
    if (quantity < 1 || !Number.isInteger(quantity) || !variantId) {
      toast.error("Invalid quantity or variant ID.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await addItemToCart({ variantId, quantity });
      if (result.error) {
        toast.error(result.error);
      } else {
        refreshCount();
        toast.success("Item added to cart successfully.");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  //   handleAddToCart using KeyboardEvent
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        handleAddToCart();
      }
    };
    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  });

  return (
    <Button
      size={"lg"}
      className="grow h-10"
      type="button"
      onClick={handleAddToCart}
      disabled={isLoading || !variantId}
    >
      {isLoading ? <Spinner /> : "Add to Cart"}
    </Button>
  );
}
