"use client";

import { useCartCount } from "@/lib/provider/cart-provider";

import React from "react";
import { MobileMenu } from "./mobile-menu";
import { Separator } from "@/components/ui/separator";
import { SearchButton } from "../shared/search-dialog";
import { CurrencySelector } from "../shared/currency-selector";
import UserButtonClient from "../shared/user-button";
import MenuButton from "../shared/menu_button";
import { WishlistButton } from "../shared/wishlist_button";
import { CartButton } from "../shared/cart_button";

export default function Navbar() {
  const { count, loading } = useCartCount();
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      <div className="flex  gap-2 lg:gap-4 items-center">
        {/* <DesktopMobile /> */}
        <SearchButton />
        <nav className="hidden lg:flex h-5 gap-2 lg:gap-4 items-center">
          <Separator orientation="vertical" />
          <CurrencySelector />
          <Separator orientation="vertical" />
          <WishlistButton />
          <Separator orientation="vertical" />
          <CartButton count={count} isloading={loading} />
          <Separator orientation="vertical" />
          <UserButtonClient />
        </nav>

        {/* <NavbarMobile /> */}
        <nav className="lg:hidden h-5 flex gap-2 lg:gap-4 items-center">
          <Separator orientation="vertical" />
          <CartButton count={count} isloading={loading} />
          <Separator orientation="vertical" />
          <MenuButton isOpen={isOpen} onClick={toggleMenu} />
        </nav>
      </div>
      <MobileMenu isOpen={isOpen} setIsOpen={setIsOpen} />
    </>
  );
}

// const NavbarMobile = () => {
//   const { count, loading } = useCartCount();

//   return (
//     <nav className="flex items-center  gap-2 lg:hidden">
//       <CartButton count={count} isloading={loading} />
//       <MobileMenu />
//     </nav>
//   );
// };
{
  /* <Button variant={"ghost"} size={"icon"} asChild>
        {user ? (
          <UserButton />
        ) : (
          <Link href="/auth/login">
            <LogIn />
          </Link>
        )}
      </Button> */
}
