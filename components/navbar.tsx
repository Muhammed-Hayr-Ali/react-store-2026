"use client";
import Link from "next/link";
import { AppLogo } from "./custom-ui/app-logo";
import { MobileNav } from "./custom-ui/mobile_menu";
import { SearchButton } from "./custom-ui/search-button";
import { UserButton } from "./custom-ui/user-button";
import { WishlistButton } from "./custom-ui/wishlist_button";
import { CartIcon } from "./dashboard/cart/CartIcon";
export default function Navbar() {
  return (
    <nav className="sticky top-0 z-40 w-full bg-background border-b">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href={"/"}>
          <AppLogo />
        </Link>

        <MobileNav />

        <div className="hidden lg:flex gap-4 items-center">
          <SearchButton />
          <div className="w-px h-5 bg-border " />
          <UserButton />
          <button className="w-px h-5 bg-border " />
          <WishlistButton />
          <div className=" w-px h-5 bg-border " />

          <CartIcon />
        </div>
      </div>
    </nav>
  );
}
