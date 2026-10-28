/**
 * @file lib/actions/brands/queries/get-brands-page-data.ts
 * @description Loads brand rows and page-specific assets for the brands page.
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
  brandImages: string[]
  isMobile: boolean
}

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
      brandImages,
      isMobile,
    },
  }
}