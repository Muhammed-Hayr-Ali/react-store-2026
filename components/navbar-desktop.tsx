"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { WishlistButton } from "./custom-ui/wishlist_button";
import { LogIn, Search } from "lucide-react";
import { UserButton } from "./custom-ui/user-button";
import { useUser } from "@/lib/provider/user-provider";
import { SearchDialog } from "./custom-ui/search-dialog";
import { Kbd } from "./ui/kbd";
import { CartButton } from "./custom-ui/cart_button";
import { useCartCount } from "@/lib/provider/cart-provider";

export default function NavbarDesktop() {
  const { user } = useUser();
  const { count, loading } = useCartCount();

  return (
    <nav className="hidden lg:flex gap-4 items-center">
      <SearchDialog>
        <div className="flex rounded-sm h-12 lg:h-8 items-center bg-[#F2F2F2] hover:bg-[#EBEBEB] dark:bg-[#1A1A1A] dark:hover:bg-[#1F1F1F] justify-between min-w-3xs px-1.5 py-2">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground block lg:hidden" />
            <span className="text-xs font-mono font-normal">
              Search Products...
            </span>
          </div>
          <Kbd dir="ltr" className="bg-background hidden lg:block">
            ⌘K
          </Kbd>
        </div>
      </SearchDialog>
      <div className="w-px h-5 bg-border " />
      <Button variant={"ghost"} size={"icon"} asChild>
        {user ? (
          <UserButton />
        ) : (
          <Link href="/auth/login">
            <LogIn />
          </Link>
        )}
      </Button>
      <button className="w-px h-5 bg-border " />
      <WishlistButton />
      <div className=" w-px h-5 bg-border " />
      <CartButton count={count} isloading={loading} />
    </nav>
  );
}
