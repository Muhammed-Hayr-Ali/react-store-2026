import { ForgotPasswordPage } from "@/components/auth/forgot-password-page";
import { createMetadata } from "@/lib/metadata";

export function generateMetadata() {
  return createMetadata({
    title: "Forgot Password",
    description: "Forgot Password to your account",
  });
}

export default function Page() {
  return <ForgotPasswordPage />;
}
