import { MfaGuard } from "@/lib/guards/mfa-guard";
import Footer from "@/components/footer";
import Header from "@/components/header";
import Navbar from "@/components/navbar";
import { AppLogo } from "@/components/custom-ui/app-logo";
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
