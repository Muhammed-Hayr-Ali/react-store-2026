import { getTranslations } from "next-intl/server"

 import { Card, CardContent } from "@/components/ui/card"
import { APP_CONFIG } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"
import { AuthCallbackView } from "@/components/authentication/auth-callback-view"

interface CallbackPageProps {
  searchParams: Promise<{ code?: string; error?: string }>
}

export async function generateMetadata() {
  const t = await getTranslations("AuthCallback")

  return createMetadata({
    siteName: APP_CONFIG.NAME,
    title: t("META_TITLE"),
    description: t("META_DESCRIPTION"),
  })
}

export default async function CallbackPage({
  searchParams,
}: CallbackPageProps) {
  const { code, error } = await searchParams

  return (
    <Card>
      <CardContent>
        <AuthCallbackView  code={code} error={error} />
      </CardContent>
    </Card>
  )
}
