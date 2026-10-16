/**
 * @file lib/actions/categories/queries/get-categories-page-data.ts
 * @description Handles all business logic, data fetching, summary calculations, and environment checks for the categories page.
 */

import { readdir } from "node:fs/promises"
import path from "node:path"
import { headers } from "next/headers"

import type { ApiResult } from "@/lib/actions/types/utils"
import { getCategories } from "./get-categories"
import type { Category } from "../types"

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

/**
 * تجهز بيانات التصنيفات وملخصها وصور التصنيفات وحالة عرض الهاتف.
 */
export async function getCategoriesPageData(): Promise<
  ApiResult<CategoriesPageData>
> {
  const result = await getCategories({ includeInactive: true })
  if (!result.success) {
    return {
      success: false,
      error: result.error,
      details: result.details,
    }
  }

  const categories = result.data

  const total = categories.length
  const active = categories.filter((c) => c.is_active === true).length
  const inactive = total - active

  const categoryImageDirectory = path.join(
    process.cwd(),
    "public",
    "site-assets",
    "categories"
  )

  let categoryImages: string[] = []
  try {
    const entries = await readdir(categoryImageDirectory, {
      withFileTypes: true,
    })
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
