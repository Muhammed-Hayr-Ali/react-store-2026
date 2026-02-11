import VerifyMfaPage from "@/components/others/verify-mfa-Page";
import { VerifyMfaGuard } from "@/lib/guards/verify-mfa";
import { createMetadata } from "@/lib/metadata";

export function generateMetadata() {
  return createMetadata({
    title: "Verify Login",
    description: "Enter your two-factor authentication code to complete login.",
  });
}

export default async function Page() {
  return (
    <>
      <VerifyMfaGuard />
      <VerifyMfaPage />
    </>
  );
}
