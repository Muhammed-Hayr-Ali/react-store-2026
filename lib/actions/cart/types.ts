/**
 * @file lib/actions/cart/types.ts
 * @description TypeScript types and interfaces for Cart system with variant-specific image support.
 */

import type { Tables } from "@/lib/database/supabase/types"

export type CartRecord = Tables<"carts">
export type CartItemRecord = Tables<"cart_items">

export type CartItemQueryResult = CartItemRecord & {
  products: Pick<
    Tables<"products">,
    "id" | "name" | "description" | "slug"
  > & {
    product_images: Pick<
      Tables<"product_images">,
      "url" | "is_primary" | "variant_id"
    >[]
  }
  product_variants: Pick<
    Tables<"product_variants">,
    "id" | "price" | "stock_quantity" | "track_inventory" | "sku"
  >
  resolved_image_url: string | null
}

export type CartQueryResult = CartRecord & {
  items: CartItemQueryResult[]
}
