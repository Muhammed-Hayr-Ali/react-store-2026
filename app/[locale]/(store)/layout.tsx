import { MfaGuard } from "@/lib/guards/mfa-guard";
import Footer from "@/components/footer";
import { DynamicBreadcrumb } from "@/components/custom-ui/dynamic-breadcrumb";
import Header from "@/components/header";
import Navbar from "@/components/navbar";
import Link from "next/link";
import { AppLogo } from "@/components/custom-ui/app-logo";
type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <div>
      <MfaGuard />
      <Header>
        <Link href={"/"}>
          <AppLogo />
        </Link>
        <Navbar />
      </Header>
      <DynamicBreadcrumb />
      <div className="min-h-[80vh] flex items-center justify-center ">
        {children}
      </div>
      <Footer />
    </div>
  );
}
