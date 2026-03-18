import { createMetadata } from "@/lib/config/metadata_generator"
import VerifyForm from "@/components/auth/verify-form"

export const metadata = createMetadata({
  title: "Verify",
  description:
    "Verify your identity to continue accessing your Marketna account.",
  path: "/verify",
})

export default function Page() {
  return <VerifyForm />
}
