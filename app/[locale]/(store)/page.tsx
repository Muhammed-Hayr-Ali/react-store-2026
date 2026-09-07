import StorePage from "@/components/store/home/StorePage"
import { appConfig } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"
import { getTranslations } from "next-intl/server"

export async function generateMetadata() {
  // const t = await getTranslations()

  return createMetadata({
    siteName: appConfig.name,
    title: "Store",
    description:
      "Welcome to your Marketna store! Access your personalized shopping experience, track orders, and manage your preferences.",
  })
}

export default function Page() {
  return (
    <main >                
      <StorePage />
      <div className="min-h-screen"></div>
      <div className="min-h-screen"></div>
    </main>
  )
}
