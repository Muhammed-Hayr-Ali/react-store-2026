import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import { MfaGuard } from "@/lib/middleware/mfa-guard";

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await MfaGuard();

  return (
    <main>
      <Header />
      {children}
      {/* <AuthDebug /> */}
      <Footer />
    </main>
  );
}
