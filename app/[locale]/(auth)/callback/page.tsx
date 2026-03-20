import { createMetadata } from "@/lib/config/metadata_generator"
import CallbackPage from "@/components/auth/callback-page"
import { getTranslations } from "next-intl/server"

export async function generateMetadata() {
  const t = await getTranslations()

  return createMetadata({
    siteName: t("siteName"),
    title: t("seo.auth.callback.title"),
    description: t("seo.auth.callback.description"),
    noindex: true,
  })
}

export default function Page() {
  return <CallbackPage />
}
