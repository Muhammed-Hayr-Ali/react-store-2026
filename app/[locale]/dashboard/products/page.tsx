import StorePage from "@/components/store/home/StorePage"
import { appConfig } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"
import { getTranslations } from "next-intl/server"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"

export async function generateMetadata() {
  // const t = await getTranslations()

  return createMetadata({
    siteName: appConfig.name,
    title: "Categories",
    description:
      "Mange your Marketna categories to access your personalized shopping experience, track orders, and manage your preferences.",
  })
}

export default function Page() {
  return <div className="bg-red-200 min-h-screen w-full"></div>
}
