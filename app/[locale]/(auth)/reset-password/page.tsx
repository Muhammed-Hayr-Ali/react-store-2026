import { createMetadata } from "@/lib/config/metadata_generator"
import ResetPasswordForm from "@/components/auth/reset-password-form"

export const metadata = createMetadata({
  title: "Reset Password",
  description: "Enter your new password to reset your account password.",
  path: "/reset-password",
  noindex: true,
})

export default function Page() {
  return <ResetPasswordForm />
}
