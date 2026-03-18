import { createMetadata } from "@/lib/config/metadata_generator";
import TwoFactorSetupPage from "@/components/auth/two-factor-setup-page";

export const metadata = createMetadata({
  title: "Setup Two-Factor Authentication",
  description: "Secure your account with two-factor authentication",
  path: "/two-factor/setup",
});

export default function Page() {
  return <TwoFactorSetupPage />;
}
