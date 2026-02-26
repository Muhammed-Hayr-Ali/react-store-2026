"use client";

import { WishlistButton } from "./custom-ui/wishlist_button";
import { CartButton } from "./custom-ui/cart_button";
import { useCartCount } from "@/lib/provider/cart-provider";
import { SearchButton } from "./custom-ui/search-dialog";
import UserButtonClient from "./user-button";
import MenuButton from "./custom-ui/menu_button";
import React from "react";
import { MobileMenu } from "./mobile-menu";

export default function Navbar() {
  const { count, loading } = useCartCount();
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      <div className="flex  gap-2 lg:gap-4 items-center">
        {/* <DesktopMobile /> */}
        <SearchButton />
        <nav className="hidden lg:flex gap-2 lg:gap-4 items-center">
          <button className="w-px h-5 bg-border " />
          <WishlistButton />
          <div className=" w-px h-5 bg-border " />
          <CartButton count={count} isloading={loading} />
          <button className="w-px h-5 bg-border " />
          <UserButtonClient />
        </nav>

        {/* <NavbarMobile /> */}
        <nav className="lg:hidden flex gap-2 lg:gap-4 items-center">
          <div className=" w-px h-5 bg-border " />
          <CartButton count={count} isloading={loading} />
          <div className=" w-px h-5 bg-border " />
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
