import { appConfig } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"
import {
  CategoriesEmptyState,
  CategoriesErrorState,
  CategoriesTable,
} from "@/components/dashboard/categories"
import { getAllCategories } from "@/lib/actions/categories/queries/get-all"
import { Category } from "@/lib/actions/categories"
import CreateCategory from "@/components/dashboard/categories/forms/create-form"

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
  let categories = null
  const result = await getAllCategories({ activeOnly: false })

  if (result.success && result.data) {
    categories = result.data 
  }

  return <CreateCategory categories={categories} />
}
