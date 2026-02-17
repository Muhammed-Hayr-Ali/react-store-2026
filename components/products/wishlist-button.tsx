'use client'
import { addToWishlist, removeFromWishlist } from "@/lib/actions/wishlist";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { Heart } from "lucide-react";

export default function WishlistButton({
  productId,
  initialIsWishlisted,
}: {
  productId: string;
  initialIsWishlisted: boolean;
}) {
  const [isWishlisted, setIsWishlisted] = useState(initialIsWishlisted);
  const [isPending, startTransition] = useTransition();

  const handleWishlistToggle = () => {
    startTransition(async () => {
      const action = isWishlisted ? removeFromWishlist : addToWishlist;
      const result = await action(productId);
      if (result.success) {
        toast.success(result.message);
        setIsWishlisted(!isWishlisted);
      } else {
        toast.error(result.error || "Failed to update wishlist");
      }
    });
  };

  return (
    <Button
      size="lg"
      variant="outline"
      className="shrink-0 aspect-square p-0"
      onClick={handleWishlistToggle}
      disabled={isPending}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      {isPending ? (
        <Spinner />
      ) : (
        <Heart
          className={`h-6 w-6 transition-all ${
            isWishlisted
              ? "fill-destructive text-destructive"
              : "text-muted-foreground"
          }`}
        />
      )}
    </Button>
  );
}
