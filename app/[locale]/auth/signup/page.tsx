import { SignupPage } from "@/components/features/auth/signup-page";
import { createMetadata } from "@/lib/metadata";

export function generateMetadata() {
  return createMetadata({
    title: "Signup",
    description: "Signup to your account",
  });
}
export default function Page() {
  return <SignupPage />;
}
