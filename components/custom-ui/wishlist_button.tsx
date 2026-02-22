import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";
import Link from "next/link";

export const WishlistButton = ({ className }: { className?: string }) => {
  return (
    <Button
      variant={"ghost"}
      size={"icon-sm"}
      asChild
      className={cn("", className)}
    >
      <Link href="/wishlist">
        <Heart size={16} />
      </Link>
    </Button>
  );
};
