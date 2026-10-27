/**
 * @file lib/actions/cart/types.ts
 * @description TypeScript types and interfaces for Cart system, updated with variant_sku and resolved image support.
 */

export interface CartRecord {
  id: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface CartItemRecord {
  id: string
  cart_id: string
  product_id: string
  variant_id: string
  quantity: number
  created_at: string
  updated_at: string
}

export interface CartItemQueryResult extends CartItemRecord {
  products: {
    id: string
    name: string
    description?: string | null
    slug: string
    product_images: {
      url: string
      is_primary: boolean
      variant_sku?: string | null
    }[]
    brand?: {
      name: string
      name_ar?: string | null
    } | null
  }
  product_variants: {
    id: string
    price: number
    stock_quantity: number
    track_inventory: boolean
    sku: string
    attributes?: Record<string, string> | null
  }
  resolved_image_url: string | null
}

export interface CartQueryResult extends CartRecord {
  items: CartItemQueryResult[]
}