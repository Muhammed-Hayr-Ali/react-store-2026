import { MfaGuard } from "@/lib/guards/mfa-guard";
import Footer from "@/components/footer";
import { DynamicBreadcrumb } from "@/components/custom-ui/dynamic-breadcrumb";
import Header from "@/components/header";
import { NavbarMobile } from "@/components/navbar-mobile";
import NavbarDesktop from "@/components/navbar-desktop";

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <div>
      <MfaGuard />
      <Header>
        <NavbarMobile />
        <NavbarDesktop />
      </Header>
      <DynamicBreadcrumb />
      {children}
      <Footer />
    </div>
  );
}
