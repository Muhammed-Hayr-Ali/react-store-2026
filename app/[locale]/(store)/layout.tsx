import "@/app/globals.css";
import { MfaGuard } from "@/lib/guards/mfa-guard";
import Footer from "@/components/footer";
import { DynamicBreadcrumb } from "@/components/custom-ui/dynamic-breadcrumb";
import Header from "@/components/header";
import { NavbarMobile } from "@/components/navbar-mobile";
import NavbarDesktop from "@/components/navbar-desktop";

type Props = {
  children: React.ReactNode;
};

export default async function Layout({ children }: Props) {
  return (
    <div>
      <MfaGuard />
      <Header>
        <NavbarMobile />
        <NavbarDesktop />
      </Header>
      <DynamicBreadcrumb />
      <div className="flex flex-col min-h-[calc(100vh-200px)]">{children}</div>
      <Footer />
    </div>
  );
}
