"use client";


import React from "react";
import { MobileMenu } from "./mobile-menu";
import { Separator } from "@/components/ui/separator";
import { CurrencySelector } from "../shared/currency-selector";
import MenuButton from "../shared/menu_button";
import { Heart, Search, ShoppingBag } from "lucide-react";
import UserButtonClient from "../shared/user-button";

export default function Navbar() {

  const [isOpen, setIsOpen] = React.useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      <div className="flex items-center gap-2 lg:gap-4">
        {/* <DesktopMobile /> */}
        <Search />
        <nav className="hidden h-5 items-center gap-2 lg:flex lg:gap-4">
          <Separator orientation="vertical" />
          <Heart />
          <Separator orientation="vertical" />
          <ShoppingBag />
          <Separator orientation="vertical" />
          <UserButtonClient />
        </nav>

        {/* <NavbarMobile /> */}
        <nav className="flex h-5 items-center gap-2 lg:hidden lg:gap-4">
          <Separator orientation="vertical" />
          <ShoppingBag />
          <Separator orientation="vertical" />
          <MenuButton isOpen={isOpen} onClick={toggleMenu} />
        </nav>
      </div>
      <MobileMenu isOpen={isOpen} setIsOpen={setIsOpen} />
    </>
  )
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
