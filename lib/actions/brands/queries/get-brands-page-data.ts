/**
 * @file lib/actions/brands/queries/get-brands-page-data.ts
 * @description Handles all business logic, data fetching, summary calculations, and environment checks for the brands page.
 */

"use server"

import { readdir } from "node:fs/promises"
import path from "node:path"
import { headers } from "next/headers"

import type { ApiResult } from "@/lib/actions/types/utils"
import { getBrands } from "./get-brands"
import type { BrandRecord } from "../types"

export interface BrandsPageData {
  brands: BrandRecord[]
  summary: {
    total: number
    active: number
    inactive: number
  }
  brandImages: string[]
  isMobile: boolean
}

/**
 * تجهز بيانات العلامات التجارية وملخصها وصور العلامات التجارية وحالة عرض الهاتف.
 */
export async function getBrandsPageData(): Promise<
  ApiResult<BrandsPageData>
> {
  const result = await getBrands({ includeInactive: true })
  
  if (!result.success) {
    return {
      success: false,
      error: result.error,
      details: result.details,
    }
  }

  const brands = result.data || []

  const total = brands.length
  const active = brands.filter((b) => b.is_active === true).length
  const inactive = total - active

  const brandImageDirectory = path.join(
    process.cwd(),
    "public",
    "site-assets",
    "brands"
  )

  let brandImages: string[] = []
  try {
    const entries = await readdir(brandImageDirectory, {
      withFileTypes: true,
    })
    brandImages = entries
      .filter(
        (entry) =>
          entry.isFile() && /\.(avif|gif|jpe?g|png|webp|svg)$/i.test(entry.name)
      )
      .map((entry) => entry.name)
      .sort((left, right) => left.localeCompare(right))
  } catch {
    brandImages = []
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
      brands,
      summary: { total, active, inactive },
      brandImages,
      isMobile,
    },
  }
}