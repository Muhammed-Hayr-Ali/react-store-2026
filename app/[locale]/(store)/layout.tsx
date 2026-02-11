import "@/app/globals.css";
import { MfaGuard } from "@/lib/guards/mfa-guard";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { DynamicBreadcrumb } from "@/components/custom-ui/dynamic-breadcrumb";

type Props = {
  children: React.ReactNode;
};

export default async function Layout({ children }: Props) {
  return (
    <div>
      <MfaGuard />
      <Navbar />
      <DynamicBreadcrumb />
      {children}
      <Footer />
    </div>
  );
}
