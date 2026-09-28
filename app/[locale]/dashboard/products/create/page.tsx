import { appConfig } from "@/lib/config/app_config"
import { createMetadata } from "@/lib/config/metadata_generator"
import CreateProductForm from "@/components/dashboard/products/create/create-product-form"
import { Category, getAllCategories } from "@/lib/actions/categories"
import { late } from "zod/v3"
import { getAllBrand } from "@/lib/actions/brands/queries/get-all"
import { Brand } from "@/lib/actions/brands"

export async function generateMetadata() {
  return createMetadata({
    siteName: appConfig.name,
    title: "إضافة منتج جديد",
    description:
      "إضافة منتج جديد إلى متجر Marketna مع إدارة التفاصيل الأساسية.",
  })
}

export default async function Page() {
  const resultCategories = await getAllCategories({ activeOnly: true })

  const resultBrands = await getAllBrand()

  let categories: Category[] = []
  let brands: Brand[] = []

  if (resultCategories.success && resultCategories.data) {
    categories = resultCategories.data
  }

  if (resultBrands.success && resultBrands.data) {
    brands = resultBrands.data
  }

  return <CreateProductForm categories={categories} brands={brands} />
}
