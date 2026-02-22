"use client";

import { WishlistButton } from "./custom-ui/wishlist_button";
import { CartButton } from "./custom-ui/cart_button";
import { useCartCount } from "@/lib/provider/cart-provider";
import { MobileMenu } from "./mobile-menu";
import { SearchButton } from "./custom-ui/search-dialog";

export default function Navbar() {
  const { count, loading } = useCartCount();

  return (
    <div className="flex  gap-2 lg:gap-4 items-center">
      {/* <DesktopMobile /> */}
      <SearchButton />
      <nav className="hidden lg:flex gap-2 lg:gap-4 items-center">
        <button className="w-px h-5 bg-border " />
        <WishlistButton />
        <div className=" w-px h-5 bg-border " />
        <CartButton count={count} isloading={loading} />
      </nav>

      {/* <NavbarMobile /> */}
      <nav className="lg:hidden flex gap-2 lg:gap-4 items-center">
        <div className=" w-px h-5 bg-border " />
        <CartButton count={count} isloading={loading} />
        <div className=" w-px h-5 bg-border " />
        <MobileMenu />
      </nav>
    </div>
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
