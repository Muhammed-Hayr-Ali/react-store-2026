import Link from "next/link";
import { AppLogo } from "./custom-ui/app-logo";

interface NavbarProps {
  children?: React.ReactNode;
}
export default function Header({ children }: NavbarProps) {
  return (
    <header  className="sticky top-0 z-50 w-full  border-b">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between bg-background/50 backdrop-blur-lg ">
        <Link href={"/"}>
          <AppLogo />
        </Link>
        {children}
      </div>
    </header>
  );
}

