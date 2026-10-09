/**
 * @file app/[locale]/(auth)/callback/page.tsx
 * @description OAuth redirect landing route resolving authorization parameters.
 */

import { getTranslations } from "next-intl/server"

import { OAuthCallbackView } from "@/components/auth/oauth-callback-view"
import { appConfig } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"

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
  const t = await getTranslations("OAuthCallback")

  return createMetadata({
    siteName: appConfig.name,
    title: t("META_TITLE"),
    description: t("META_DESCRIPTION"),
  })
}

export default async function CallbackPage({
  params,
  searchParams,
}: CallbackPageProps) {
  await params
  const { code, error, error_description } = await searchParams

  return (
    <OAuthCallbackView
      code={code}
      error={error}
      errorDescription={error_description}
    />
  )
}