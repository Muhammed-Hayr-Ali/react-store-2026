/**
 * @file lib/actions/store/types.ts
 * @description Types for storefront product queries.
 */

export interface SimplifiedFeaturedProduct {
  id: string
  name: string
  slug: string
  description?: string | null
  price: number | null
  compare_at_price: number | null
  image_url: string | null
  image_alt: string | null
}

export interface FeaturedProduct {
  id: string
  name: string
  slug: string
  description?: string | null
  product_variants?: Array<{
    price: number
    compare_at_price?: number | null
  }>
  product_images?: Array<{
    url: string
    alt_text?: string | null
    is_primary: boolean
  }>
}