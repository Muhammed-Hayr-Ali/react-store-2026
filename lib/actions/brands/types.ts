/**
 * @file lib/actions/brands/types.ts
 * @description TypeScript types and interfaces for Brands entity.
 */

export interface BrandRecord {
  id: string
  name: string
  name_ar: string | null
  slug: string
  description: string | null
  description_ar: string | null
  image_url: string | null
  image_alt: string | null
  is_active: boolean
  sort_order: number
  meta_title: string | null
  meta_description: string | null
  created_at: string
  updated_at: string
}

export interface BrandsSummary {
  total: number
  active: number
  inactive: number
}
