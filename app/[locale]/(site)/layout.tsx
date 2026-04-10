import Footer from "@/components/layout/footer";
import { MfaGuard } from "@/lib/middleware/mfa-guard";

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await MfaGuard();

  return (
    <main>
      {children}
      {/* <AuthDebug /> */}
      <Footer />
    </main>
  );
}
