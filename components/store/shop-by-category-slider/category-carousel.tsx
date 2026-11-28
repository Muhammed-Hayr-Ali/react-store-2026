/**
 * @file components/store/shop-by-category-slider/category-carousel.tsx
 * @description Server Component يجلب التصنيفات الرئيسية ويعرض سلايدر التصنيفات.
 */

import { getAllCategories } from "@/lib/actions/store/queries/get-all-categories"
import { CategoryCarouselClient } from "./category-carousel-client"

export default async function CategoryCarousel() {
  const result = await getAllCategories()
  const categories = result.success ? result.data : []

  if (categories.length === 0) return null

  return <CategoryCarouselClient categories={categories} />
}