import { appConfig } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"
import { getCategories } from "@/lib/actions/categories"

export async function generateMetadata() {
  // const t = await getTranslations()

  return createMetadata({
    siteName: appConfig.name,
    title: "Account",
    description:
      "Mange your Marketna account to access your personalized shopping experience, track orders, and manage your preferences.",
  })
}

export default async function Page() {



  return <>Account</>

}