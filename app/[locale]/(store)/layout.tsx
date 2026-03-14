import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import Navbar from "@/components/layout/navbar";
import { AppLogo } from "@/components/shared/app-logo";
import { MfaGuard } from "@/lib/guards/mfa-guard";
import Link from "next/link";
type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <div>
      <MfaGuard />
      <Header>
        <Link href="/">
          <AppLogo />
        </Link>
        <Navbar />
      </Header>
      <div className="min-h-[81vh] flex items-center justify-center ">
        {children}
      </div>
      <Footer />
    </div>
  );
}
