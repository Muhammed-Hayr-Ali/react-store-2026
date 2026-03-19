"use client"

import React from "react"
import { MobileMenu } from "@/components/ui/mobile-menu"
import { Separator } from "@/components/ui/separator"
import MenuButton from "@/components/shared/menu_button"
import { ShoppingCartIcon, UserIcon } from "@/components/shared/icons"

export default function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)

  return (
    <div className="flex items-center">
      {/* <DesktopMobile /> */}

      <nav className="hidden h-5 flex-1 items-center gap-2 lg:flex lg:gap-4">
        <ShoppingCartIcon />
        <Separator orientation="vertical" />
        <UserIcon />
      </nav>

      {/* <NavbarMobile /> */}
      <nav className="flex-1 items-center gap-3 lg:hidden lg:gap-4">
        <MenuButton isOpen={isOpen} onClick={toggleMenu} />
      </nav>

      <MobileMenu isOpen={isOpen} onOpenChange={setIsOpen} />
    </div>
  )
}
