"use client";
import Link from "next/link";
import { AppLogo } from "./custom-ui/app-logo";

interface NavbarProps {
  children?: React.ReactNode;
}
export default function Header({ children }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full  bg-background border-b">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href={"/"}>
          <AppLogo />
        </Link>
        {children}
      </div>
    </header>
  );
}

