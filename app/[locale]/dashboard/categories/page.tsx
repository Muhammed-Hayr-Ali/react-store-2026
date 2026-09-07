import { appConfig } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"
import { getCategories } from "@/lib/actions/categories"
import {
  CategoriesEmptyState,
  CategoriesErrorState,
  CategoriesTable,
} from "@/components/dashboard/categories"

export async function generateMetadata() {
  // const t = await getTranslations()

  return createMetadata({
    siteName: appConfig.name,
    title: "Categories",
    description:
      "Mange your Marketna categories to access your personalized shopping experience, track orders, and manage your preferences.",
  })
}

export default async function Page() {
  const result = await getCategories({ activeOnly: false })




  if (!result.success) {
    return <CategoriesErrorState />
  }

  const categories = result.data || []

  if (categories.length === 0) {
    return <CategoriesEmptyState />
  }

  return <CategoriesTable data={result.data} />

}