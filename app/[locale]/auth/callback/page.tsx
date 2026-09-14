import CallbackPage from "@/components/auth/callback-page"
import { appConfig } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"
import { getTranslations } from "next-intl/server"


export async function generateMetadata() {
   const t = await getTranslations()

  return createMetadata({
    siteName: appConfig.name,
    title: "Authantication Callback",
    description: "Authentication callback page for Marketna",
  })
}


export interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function Page({ searchParams }: Props) {
  // Search params are used to get the code and error from the query string
  const searchParamsResolved = await searchParams
  const code = searchParamsResolved.code as string | undefined
  const error = searchParamsResolved.error as string | undefined
  const errorDescription = searchParamsResolved.error_description as
    string | undefined


  //  return error ui message if there is an error
    return <CallbackPage error={error} errorDescription={errorDescription} code={code} />
}
