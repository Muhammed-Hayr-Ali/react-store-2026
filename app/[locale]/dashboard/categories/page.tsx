import { appConfig } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"
import {
  CategoriesEmptyState,
  CategoriesErrorState,
  CategoriesTable,
} from "@/components/dashboard/categories"
import { getAllCategories } from "@/lib/actions/categories/queries/get-all"

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
  //
  const result = await getAllCategories({ activeOnly: false })

  if (!result.success) {
    return <CategoriesErrorState />
  }

  const categories = result.data

  if (!categories || categories.length === 0) {
    return <CategoriesEmptyState />
  }

  return <CategoriesTable data={categories} />
}
