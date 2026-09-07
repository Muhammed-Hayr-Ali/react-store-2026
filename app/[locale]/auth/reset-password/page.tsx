import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { createMetadata } from "@/lib/config/metadata_generator"
import { getTranslations } from "next-intl/server"

export async function generateMetadata() {
  // const t = await getTranslations()

  return createMetadata({
    siteName: "Marketna",
    title: "Reset Password",
    description:
      "Reset your Marketna password to access your account and continue shopping.",
  })
}

export default function Page() {
  return <ResetPasswordForm />
}
