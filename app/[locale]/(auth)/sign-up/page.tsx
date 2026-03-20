import { createMetadata } from "@/lib/config/metadata_generator"
import SignUpForm from "@/components/auth/sign-up-form"
import { getTranslations } from "next-intl/server"

export async function generateMetadata() {
  const t = await getTranslations()

  return createMetadata({
    siteName: t("siteName"),
    title: t("seo.auth.signUp.title"),
    description: t("seo.auth.signUp.description"),
  })
}

export default function Page() {
  return <SignUpForm />
}
