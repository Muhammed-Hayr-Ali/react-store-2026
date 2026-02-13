import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import Link from "next/link";

export const WishlistButton = () => {
    return (
      <Button
        variant={"ghost"}
        asChild
        className="flex rounded-sm h-8 items-center hover:bg-[#EBEBEB] dark:hover:bg-[#1F1F1F] justify-between w-fit px-2 py-2"
      >
        <Link href="/wishlist">
          <Heart size={16} />
        </Link>
      </Button>
    );
};