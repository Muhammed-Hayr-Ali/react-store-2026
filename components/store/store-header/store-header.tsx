/**
 * @file components/store/store-header/store-header.tsx
 * @description Server Component يجلب التصنيفات ويمررها إلى الجزء التفاعلي من الهيدر.
 */

import { getAllCategories } from "@/lib/actions/store/queries/get-all-categories"
import { StoreHeaderClient } from "./store-header-client"

export async function StoreHeader() {
  const result = await getAllCategories()
  const categories = result.success ? result.data : []

  // فلترة التصنيفات الرئيسية النشطة فقط، وتتم على الخادم
  const rootCategories = categories.filter(
    (category) =>
      (!("parent_id" in category) || category.parent_id === null) &&
      (!("is_active" in category) || category.is_active !== false)
  )

  // لا نُرجع null عند غياب التصنيفات: بقية الهيدر يجب أن تبقى ظاهرة
  return <StoreHeaderClient rootCategories={rootCategories} />
}
