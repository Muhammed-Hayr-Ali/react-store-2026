/**
 * @file lib/actions/categories/queries/get-categories-page-data.ts
 * @description Handles all business logic, data fetching, summary calculations, and environment checks for the categories page.
 */

import { readdir } from "node:fs/promises"
import path from "node:path"
import { headers } from "next/headers"
import { getCategories, type Category } from "@/lib/actions/categories"

export interface CategoriesPageData {
  categories: Category[]
  summary: {
    total: number
    active: number
    inactive: number
  }
  categoryImages: string[]
  isMobile: boolean
}

export async function getCategoriesPageData(): Promise<{
  success: boolean
  data?: CategoriesPageData
  error?: string
}> {
  // 1. Fetch categories including inactive records
  const result = await getCategories({ includeInactive: true })
  if (!result.success) {
    return { success: false, error: result.error }
  }

  const categories = result.data

  // 2. Calculate summary statistics (Separation of Concerns)
  const total = categories.length
  const active = categories.filter((c) => c.is_active === true).length
  const inactive = total - active

  // 3. Read category asset images from the filesystem
  const categoryImageDirectory = path.join(
    process.cwd(),
    "public",
    "site-assets",
    "categories"
  )
  
  let categoryImages: string[] = []
  try {
    const entries = await readdir(categoryImageDirectory, { withFileTypes: true })
    categoryImages = entries
      .filter(
        (entry) =>
          entry.isFile() && /\.(avif|gif|jpe?g|png|webp|svg)$/i.test(entry.name)
      )
      .map((entry) => entry.name)
      .sort((left, right) => left.localeCompare(right))
  } catch {
    categoryImages = []
  }

  // 4. Detect mobile device from user-agent headers
  const headersList = await headers()
  const userAgent = headersList.get("user-agent") || ""
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      userAgent
    )

  return {
    success: true,
    data: {
      categories,
      summary: { total, active, inactive },
      categoryImages,
      isMobile,
    },
  }
}