import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import Link from "next/link";

export const WishlistButton = () => {
  return (
    <Button
      variant={"ghost"}
      size={"icon-sm"}
      asChild
    >
      <Link href="/wishlist">
        <Heart size={16} />
      </Link>
    </Button>
  );
};
