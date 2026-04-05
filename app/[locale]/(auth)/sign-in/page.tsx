import { createMetadata } from "@/lib/config/metadata_generator"
import SignInForm from "@/components/auth/sign-in-form"
import { getTranslations } from "next-intl/server"

export async function generateMetadata() {
  const t = await getTranslations()

  return createMetadata({
    siteName: t("siteName"),
    title: t("seo.auth.signIn.title"),
    description: t("seo.auth.signIn.description"),
  })
}

export default function Page() {
  return <SignInForm />
}
