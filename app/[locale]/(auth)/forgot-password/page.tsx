import { createMetadata } from "@/lib/config/metadata_generator"
import ForgotPasswordForm from "@/components/auth/forgot-password-form"

export const metadata = createMetadata({
  title: "Forgot Password",
  description: "Reset your password. Enter your email address to receive a password reset link.",
  path: "/forgot-password",
})

export default function Page() {
  return (
    <ForgotPasswordForm />
  )
}
