/**
 * @file app/[locale]/(auth)/callback/page.tsx
 * @description OAuth redirect landing route resolving authorization parameters.
 */

import { getTranslations } from "next-intl/server"

import { AuthCallbackView } from "@/components/authentication/auth-callback-view"
import { appConfig } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface CallbackPageProps {
  params: Promise<{
    locale: string
  }>
  searchParams: Promise<{
    code?: string
    error?: string
    error_description?: string
  }>
}

export async function generateMetadata({ params }: CallbackPageProps) {
  await params
  const t = await getTranslations("AuthCallback")

  return createMetadata({
    siteName: appConfig.name,
    title: t("META_TITLE"),
    description: t("META_DESCRIPTION"),
  })
}

export default async function CallbackPage({
   searchParams,
}: CallbackPageProps) {
  const t = await getTranslations("AuthCallback")
  const { code, error } = await searchParams

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">{t("TITLE")}</CardTitle>
        <CardDescription>{t("SUBTITLE")}</CardDescription>
      </CardHeader>
      <CardContent>
        <AuthCallbackView code={code} error={error} />
      </CardContent>
    </Card>
  )
}
